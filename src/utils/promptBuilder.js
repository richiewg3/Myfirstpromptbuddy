export function buildPrompt({ sceneBody, globals, characters, promptOrder }) {
  const parts = [];

  const getGlobalText = () => {
    const p = [];
    const add = (val, label) => {
      const t = (val ?? '').trim();
      if (t) p.push(`${label}: ${t}`);
    };
    add(globals?.style, 'STYLE');
    add(globals?.camera, 'CAMERA');
    add(globals?.light, 'LIGHTING');
    add(globals?.rules, 'NEGATIVE');
    return p.join('\n\n');
  };

  const getCharsText = () => {
    const p = [];
    for (const char of characters ?? []) {
      const desc = (char?.text ?? '').trim();
      if (char?.active && desc) {
        const name = (char?.name ?? 'Unnamed').toUpperCase();
        p.push(`CHARACTER (${name}): ${desc}`);
      }
    }
    return p.join('\n\n');
  };

  const getSceneText = () => {
    const t = (sceneBody ?? '').trim();
    return t ? `SCENE: ${t}` : '';
  };

  for (const item of promptOrder ?? []) {
    let text = '';
    if (item.id === 'global') text = getGlobalText();
    if (item.id === 'chars') text = getCharsText();
    if (item.id === 'scene') text = getSceneText();
    if (text) parts.push(text);
  }

  return parts.join('\n\n');
}

