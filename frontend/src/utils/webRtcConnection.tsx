/**
 * negotiate function for establishing sdp and ice with webRTC peer connections
 *
 * @param pc - peer connection to use
 * @param transceiverMapping - map of transceiver to stream name to pass to peer
 */

export async function negotiate(
  pc: RTCPeerConnection,
  transceiverMapping: { [key: string]: RTCRtpTransceiver },
) {
  // create offer
  const offer = await pc.createOffer();
  // set offer as local description
  await pc.setLocalDescription(offer);

  // wait for ice gathering
  await new Promise<void>((resolve) => {
    if (pc.iceGatheringState === "complete") {
      resolve();
    } else {
      function checkState() {
        if (pc.iceGatheringState === "complete") {
          pc.removeEventListener("icegatheringstatechange", checkState);
          resolve();
        }
      }
      pc.addEventListener("icegatheringstatechange", checkState);
    }
  });

  // send offer to server
  const localDescription = pc.localDescription;

  if (!localDescription) {
    throw new Error("PeerConnection localDescription is not set yet");
  }

  // pass in transciever mid to stream name mapping so peer can associate stream name with transciever
  const transceiverMidMapping: { [key: string]: string | null } =
    Object.fromEntries(
      Object.entries(transceiverMapping).map(([key, transceiver]) => [
        transceiver.mid,
        key,
      ]),
    );

  const response = await fetch(`http://localhost:8000/offer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sdp: localDescription.sdp,
      type: localDescription.type,
      transceiverMidMapping: transceiverMidMapping,
    }),
  });

  // recieve sdp answer from server
  const answer = await response.json();
  await pc.setRemoteDescription(answer);
}
