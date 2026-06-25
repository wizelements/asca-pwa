export interface AdminThemePreviewProps {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  headingFont?: string;
  bodyFont?: string;
}

export default function AdminThemePreview({
  backgroundColor,
  textColor,
  primaryColor,
  accentColor,
  buttonColor,
  buttonTextColor,
  headingFont,
  bodyFont,
}: AdminThemePreviewProps) {
  return (
    <div className="space-y-4 rounded-lg p-6" style={{ backgroundColor, color: textColor }}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
        Atlanta Saddle Club Association
      </p>
      <h3 className="mt-2 text-3xl font-bold" style={{ fontFamily: headingFont }}>We Ride To Inspire</h3>
      <p className="mt-2" style={{ fontFamily: bodyFont }}>Sample public page text using the selected background and text color.</p>
      <div className="mt-4 flex gap-3">
        <button
          className="rounded-full px-5 py-2 text-sm font-semibold"
          style={{ backgroundColor: buttonColor, color: buttonTextColor }}
        >
          Sample Button
        </button>
        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: accentColor, color: textColor }}>
          Accent Badge
        </span>
      </div>
      <div className="mt-4 rounded-lg border p-4" style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}10` }}>
        <p className="text-sm">Preview card with primary border and subtle background.</p>
      </div>
    </div>
  );
}
