type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: 32,
          fontWeight: 800,
          color: "#f9fafb",
          margin: 0,
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          style={{
            margin: "6px 0 0",
            color: "#94a3b8",
            fontSize: 14,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
