export function formatGraphDate(dateStr: string) {
    // Graphs use short month/day labels to keep the axes readable.
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatMinutes(mins: number) {
    // Sleep and screen time come from the backend in minutes.
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
}

// Risk colors match the bands used by the backend filters.
export const getRiskColor = (riskScore: string): string => {
    const score = parseFloat(riskScore);
    if (score >= 0 && score <= 3) return "#90EE90";
    if (score > 3 && score <= 7) return "#FFCE1B";
    if (score > 7) return "#FF8080";
    return "#808080";
};

export const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString();
};

export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    const formattedHours = String(hours).padStart(2, "0");

    return `${month}/${day}/${year}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
};

// Small helper for API calls where an empty chart is better than a crash.
export async function fetchJson(url: string, fallback: any) {
    try {
        const res = await fetch(url);
        if (!res.ok) return fallback;
        return await res.json();
    } catch {
        return fallback;
    }
}


