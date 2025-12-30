const metadata: Metadata = {
  title: "Tankage",
  icons:'/Tazama-logo.png'
};

export default async function TankageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
