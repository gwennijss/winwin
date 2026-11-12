/** The lights of the stand-in footage: where, how large, what colour, how fast. */
const LIGHTS = [
  { left: "8%", top: "12%", size: "7em", colour: "#FFB25C", opacity: 0.55, seconds: 17 },
  { left: "58%", top: "7%", size: "4.5em", colour: "#FF5A3D", opacity: 0.5, seconds: 13 },
  { left: "70%", top: "26%", size: "8em", colour: "#CFE3FF", opacity: 0.32, seconds: 21 },
  { left: "22%", top: "34%", size: "5em", colour: "#FF8A4A", opacity: 0.45, seconds: 15 },
  { left: "48%", top: "44%", size: "3.5em", colour: "#FFE2A8", opacity: 0.6, seconds: 11 },
  { left: "-6%", top: "56%", size: "9em", colour: "#3F6BFF", opacity: 0.28, seconds: 23 },
  { left: "64%", top: "66%", size: "6em", colour: "#FF4D5E", opacity: 0.38, seconds: 19 },
  { left: "30%", top: "80%", size: "7.5em", colour: "#FFC47A", opacity: 0.3, seconds: 14 },
];

type Props = {
  /** A real video to play instead of the stand-in, if there is one. */
  video?: string;
};

/**
 * What plays behind the text on the case page. With a video it plays that;
 * without one it shows out-of-focus lights drifting past, which is enough to
 * judge text on something that moves and varies in brightness.
 */
export function Footage({ video }: Props) {
  if (video) {
    return (
      <video
        src={video}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 size-full object-cover"
      />
    );
  }
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(168deg, #232B3A 0%, #12151C 46%, #1D1512 100%)",
      }}
    >
      {LIGHTS.map((light, index) => (
        <span
          key={index}
          className="footage-light"
          style={{
            left: light.left,
            top: light.top,
            width: light.size,
            height: light.size,
            background: light.colour,
            opacity: light.opacity,
            animationDuration: `${light.seconds}s`,
            animationDelay: `${-index * 2.3}s`,
          }}
        />
      ))}
    </div>
  );
}
