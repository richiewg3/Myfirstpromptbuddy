import { Accordion } from './Accordion';

export function CharacterCard({ character, onToggleOpen, onToggleActive, onDelete, onChangeName, onChangeText }) {
  return (
    <Accordion
      open={character.isOpen}
      onToggle={() => onToggleOpen(character.id)}
      headLeft={
        <>
          <input
            type="checkbox"
            checked={character.active}
            style={{ cursor: 'pointer' }}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggleActive(character.id)}
            aria-label={`Toggle ${character.name}`}
          />
          <span className="label">{character.name || 'Unnamed'}</span>
        </>
      }
      headRight={
        <button
          type="button"
          className="btn small danger"
          aria-label={`Delete ${character.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(character.id);
          }}
        >
          &times;
        </button>
      }
    >
      <div className="global-input-group">
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 700 }}>Name:</div>
        <input type="text" value={character.name} placeholder="Character Name" onChange={(e) => onChangeName(character.id, e.target.value)} />
      </div>
      <div className="global-input-group">
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 700 }}>Description:</div>
        <textarea value={character.text} placeholder="Describe appearance..." onChange={(e) => onChangeText(character.id, e.target.value)} />
      </div>
    </Accordion>
  );
}

