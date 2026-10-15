import json
import pathlib

books_dir = pathlib.Path('public/books')
books = []

for folder in sorted(p for p in books_dir.iterdir() if p.is_dir()):
    meta = json.loads((folder / 'meta.json').read_text(encoding='utf-8-sig'))

    chapters = []
    for file in sorted(folder.glob('[0-9]*.md')):
        first_line = file.read_text(encoding='utf-8-sig').splitlines()[0]
        chapters.append({
            'number': int(file.stem),
            'title': first_line.lstrip('# ').strip(),
        })

    book = {'id': folder.name, **meta, 'chapters': chapters}
    if (folder / 'cover.webp').exists():
        book['cover'] = f'books/{folder.name}/cover.webp'
    books.append(book)

pathlib.Path('public/books.json').write_text(
    json.dumps(books, ensure_ascii=False, indent=2), encoding='utf-8'
)
print(len(books), 'books written to public/books.json')