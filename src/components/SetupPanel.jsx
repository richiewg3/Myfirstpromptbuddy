import { useState } from 'react';
import { Accordion } from './Accordion';
import { CharacterCard } from './CharacterCard';
import { SortableList } from './SortableList';

export function SetupPanel({ state, actions, toast }) {
  const [structureOpen, setStructureOpen] = useState(false);
  const [globalOpen, setGlobalOpen] = useState(true);

  return (
    <section className="card">
      <div className="hd">
        <div className="title">1. Setup</div>
        <div style={{ margin: 0, display: 'flex', gap: 5 }}>
          <button
            type="button"
            className="btn small good"
            onClick={() => {
              const ok = actions.save();
              toast(ok ? 'Saved!' : 'Save failed');
            }}
          >
            Save
          </button>
          <button
            type="button"
            className="btn small"
            onClick={() => {
              const res = actions.load();
              toast(res.ok ? 'Loaded saved config' : 'Nothing to load');
            }}
          >
            Load
          </button>
          <button
            type="button"
            className="btn small danger"
            onClick={() => {
              if (!window.confirm('Reset everything?')) return;
              actions.reset();
              toast('Reset complete');
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bd">
        <Accordion
          id="structureAccordion"
          open={structureOpen}
          onToggle={() => setStructureOpen((v) => !v)}
          headLeft={
            <>
              <span className="label">PROMPT STRUCTURE</span>
              <span style={{ fontSize: 11, color: 'var(--accent)' }}>(Order Logic)</span>
            </>
          }
        >
          <div style={{ color: 'var(--muted)', marginBottom: 8, fontSize: 11 }}>Reorder how the final prompt is assembled.</div>
          <SortableList items={state.promptOrder} onMove={actions.moveOrder} />
        </Accordion>

        <Accordion
          id="globalAccordion"
          open={globalOpen}
          onToggle={() => setGlobalOpen((v) => !v)}
          headLeft={
            <>
              <span className="label">GLOBAL SETTINGS</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>(Style, Light, Rules)</span>
            </>
          }
        >
          <div className="global-input-group">
            <label>Style / Aesthetic</label>
            <textarea value={state.globals.style} placeholder="Pixar style, 3D render..." onChange={(e) => actions.setGlobal('style', e.target.value)} />
          </div>
          <div className="global-input-group">
            <label>Camera / Lens</label>
            <textarea value={state.globals.camera} placeholder="Wide angle, 35mm..." onChange={(e) => actions.setGlobal('camera', e.target.value)} />
          </div>
          <div className="global-input-group">
            <label>Lighting</label>
            <textarea value={state.globals.light} placeholder="Golden hour..." onChange={(e) => actions.setGlobal('light', e.target.value)} />
          </div>
          <div className="global-input-group">
            <label>Negative / Rules</label>
            <textarea value={state.globals.rules} placeholder="--no text, logos..." onChange={(e) => actions.setGlobal('rules', e.target.value)} />
          </div>
        </Accordion>

        <div className="hr" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="title" style={{ fontSize: 12, color: 'var(--accent)' }}>
            CHARACTERS
          </div>
          <button
            type="button"
            className="btn small primary"
            onClick={() => {
              actions.addCharacter();
              toast('Character added');
            }}
          >
            + Add New
          </button>
        </div>

        <div>
          {state.characters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              onToggleOpen={actions.toggleCharacterOpen}
              onToggleActive={actions.toggleCharacterActive}
              onChangeName={actions.setCharacterName}
              onChangeText={actions.setCharacterText}
              onDelete={(id) => {
                if (!window.confirm('Remove this character?')) return;
                actions.deleteCharacter(id);
                toast('Character removed');
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

