'use client';

interface Props {
  name: string;
  subtitle: string;
  salary: string;
  story: string;
  color: string;
  onClick: () => void;
}

export default function ProfileCard({ name, subtitle, salary, story, color, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg hover:-translate-y-1 ${color}`}
    >
      <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
      <p className="text-sm font-medium text-gray-700 mb-1">{subtitle}</p>
      <p className="text-sm text-gray-500 mb-3">{salary}</p>
      <p className="text-sm text-gray-600">{story}</p>
    </button>
  );
}
