/**
 * ContestantCard Component
 * Compact card with avatar circle and name, draggable
 */

const { h } = window.preact;

export function ContestantCard({
  id,
  name,
  imageUrl,
  onDragStart,
  isDragging,
  draggable = true,
  status = null,
  scoreBadge = null,
  tribe = null,
}) {
  const statusClass = status ? `contestant-card-${status}` : '';
  const tribeClass = tribe ? `contestant-card-tribe-${tribe}` : '';
  return h(
    'div',
    {
      className: `contestant-card ${isDragging ? 'dragging' : ''} ${statusClass} ${tribeClass}`.trim(),
      draggable,
      onDragStart: draggable && onDragStart ? (e) => onDragStart(e, id) : undefined,
      'data-contestant-id': id,
    },
    h('div', { className: 'contestant-image' },
      imageUrl
        ? h('img', { src: imageUrl, alt: name })
        : h('div', { className: 'placeholder' }, id)
    ),
    h('span', { className: 'contestant-name' }, name),
    scoreBadge && h('span', { className: 'contestant-score-badge' }, scoreBadge)
  );
}
