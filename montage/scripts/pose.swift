// Articulations du corps (Apple Vision, sur le Mac) sur une plage de temps, à chaque image du rush. Lancé par `npm run pose`.
//   swift scripts/pose.swift public/r1234.mp4 0 36000 public/r1234.pose.json
// Sortie : [{ t, j: { nom: [x, y, confiance] } }], t en secondes du rush, x/y entre 0 et 1, origine en haut à gauche.
// Si plusieurs personnes sont dans le cadre, garde le plus grand corps (la personne filmée est la plus proche).
import AVFoundation
import Vision

let a = CommandLine.arguments
let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let from = Double(a[2])!, to = Double(a[3])!
let track = asset.tracks(withMediaType: .video)[0]
let reader = try! AVAssetReader(asset: asset)
reader.timeRange = CMTimeRange(start: CMTime(seconds: from, preferredTimescale: 600), end: CMTime(seconds: to, preferredTimescale: 600))
let output = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
reader.add(output)
reader.startReading()

let names: [(String, VNHumanBodyPoseObservation.JointName)] = [
  ("nose", .nose), ("neck", .neck), ("lSh", .leftShoulder), ("rSh", .rightShoulder),
  ("lEl", .leftElbow), ("rEl", .rightElbow), ("lWr", .leftWrist), ("rWr", .rightWrist),
  ("lHip", .leftHip), ("rHip", .rightHip), ("root", .root), ("lKn", .leftKnee), ("rKn", .rightKnee),
  ("lAn", .leftAnkle), ("rAn", .rightAnkle),
]
var rows: [[String: Any]] = []
while let sample = output.copyNextSampleBuffer() {
  guard let px = CMSampleBufferGetImageBuffer(sample) else { continue }
  let t = CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(sample))
  let req = VNDetectHumanBodyPoseRequest()
  try? VNImageRequestHandler(cvPixelBuffer: px, options: [:]).perform([req])
  var best: [String: [Double]] = [:]
  var bestSpan = -1.0
  for obs in req.results ?? [] {
    guard let pts = try? obs.recognizedPoints(.all) else { continue }
    var j: [String: [Double]] = [:]
    var xs: [Double] = [], ys: [Double] = []
    for (k, n) in names {
      if let p = pts[n], p.confidence > 0.1 {
        let x = Double(p.location.x), y = 1 - Double(p.location.y)
        j[k] = [(x * 1000).rounded() / 1000, (y * 1000).rounded() / 1000, (Double(p.confidence) * 100).rounded() / 100]
        xs.append(x); ys.append(y)
      }
    }
    guard xs.count >= 4 else { continue }
    let span = (xs.max()! - xs.min()!) * (ys.max()! - ys.min()!)
    if span > bestSpan { bestSpan = span; best = j }
  }
  rows.append(["t": (t * 1000).rounded() / 1000, "j": best])
}
let data = try! JSONSerialization.data(withJSONObject: rows)
try! data.write(to: URL(fileURLWithPath: a[4]))
print("frames \(rows.count), with body \(rows.filter { !(($0["j"] as! [String: [Double]]).isEmpty) }.count)")
