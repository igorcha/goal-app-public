export const contact = async (form: {
    email: string;
    subject: string;
    message: string;
}, token: string) => {
    const res = await fetch("https://8ngxqqzrpc.execute-api.us-east-2.amazonaws.com/dev/contact", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to send message");
    }
    return data;
}
