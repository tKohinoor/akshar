import { CONTENT_BASE } from './config'

function Cover({ book }) {
  if (book.cover) {
    return <img className="cover" src={`${CONTENT_BASE}/${book.cover}`} alt="" />
  }
  const letter = Array.from(book.title)[0]
  return <div className="cover cover-letter">{letter}</div>
}

export default Cover