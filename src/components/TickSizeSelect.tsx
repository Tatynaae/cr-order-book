type Props = {
    value: number;
    onChange: (v: number) => void;
};

const OPTIONS = [0.01, 0.1, 1.0];

export function TickSizeSelect({ value, onChange }: Props) {
    return (
        <label className="tick">
            <span>Tick size</span>
            <select
                value={String(value)}
                onChange={(e) => onChange(Number(e.target.value))}
            >
                {OPTIONS.map((v) => (
                    <option key={v} value={String(v)}>{v}</option>
                ))}
            </select>
        </label>
    );
}
