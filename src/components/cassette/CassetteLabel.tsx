import { AutoFitText } from "./AutoFitText";

type CassetteLabelProps = {
  title: string;
  artist: string;
  senderName: string;
  message: string;
};

export function CassetteLabel({ title, artist, senderName, message }: CassetteLabelProps) {
  return (
    <foreignObject x="65" y="43" width="530" height="160" className="label-foreign-object">
      <div className="tape-label">
        <div className="label-heading">
          <span className="label-micro">SIDE A / WEEKLY TAPE</span>
          <span className="label-number">90</span>
        </div>
        <AutoFitText className="label-title" minSize={19} maxSize={30}>{title || "Untitled"}</AutoFitText>
        <AutoFitText className="label-artist" minSize={9} maxSize={12}>{artist || "Unknown artist"}</AutoFitText>
        <div className="label-rule" />
        <div className="label-bottom">
          <AutoFitText className="label-note" minSize={11} maxSize={18}>{message || "Ein Song für dich."}</AutoFitText>
          <AutoFitText className="label-sender" minSize={9} maxSize={12}>from {senderName || "jemandem"}</AutoFitText>
        </div>
      </div>
    </foreignObject>
  );
}
