export async function copyText(text) {
  const value = String(text ?? '');
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      ta.remove();
    }
  }
}

