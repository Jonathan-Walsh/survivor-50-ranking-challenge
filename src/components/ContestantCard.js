/**
 * ContestantCard Component
 * Represents a single contestant with image, name, and drag support
 */

const { h } = window.preact;

export function ContestantCard({ id, name, imageUrl, onDragStart, isDragging }) {
  return h(
    'div',
    {
      className: `contestant-card ${isDragging ? 'dragging' : ''}`,
      draggable: true,
      onDragStart: (e) => onDragStart(e, id),
      'data-contestant-id': id,
    },
    h('div', { className: 'contestant-image' },
      imageUrl
        ? h('img', { src: imageUrl, alt: name })
        : h('div', { className: 'placeholder' }, `#${id}`)
    ),
    h('div', { className: 'contestant-name' }, name)
  );
}
