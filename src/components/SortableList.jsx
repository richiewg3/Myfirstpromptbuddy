export function SortableList({ items, onMove }) {
  return (
    <div className="order-list">
      {items.map((item, index) => (
        <div className="order-item" key={item.id}>
          <span>{`${index + 1}. ${item.name}`}</span>
          <div className="controls">
            {index > 0 ? (
              <button type="button" title="Move Up" onClick={() => onMove(index, -1)}>
                ▲
              </button>
            ) : null}
            {index < items.length - 1 ? (
              <button type="button" title="Move Down" onClick={() => onMove(index, 1)}>
                ▼
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

