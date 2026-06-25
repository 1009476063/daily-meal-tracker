export const runtime = "edge";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#2f3029]">{children}</div>
  );
}
