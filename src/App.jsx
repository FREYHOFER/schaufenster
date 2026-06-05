import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpenCheck,
  CalendarDays,
  Clock3,
  Flame,
  Sparkles,
  Star,
  Store,
  Trophy,
} from 'lucide-react';
import './App.css';

const featuredBooks = [
  {
    eyebrow: 'Neu eingetroffen',
    title: 'Die Stadt der leisen Seiten',
    author: 'Mara Linden',
    genre: 'Roman',
    line: 'Ein warmes, kluges Buch uber Neuanfange, Buchladen und die kleinen Zufalle des Alltags.',
    palette: 'cover-ocean',
  },
  {
    eyebrow: 'Unsere Empfehlung',
    title: 'Atlas der Nachtzuge',
    author: 'Theo Krammer',
    genre: 'Reise & Essay',
    line: 'Fur alle, die Fernweh lieben: elegant erzahlt, wunderschon beobachtet und voller Europa-Momente.',
    palette: 'cover-ember',
  },
  {
    eyebrow: 'Bestseller der Woche',
    title: 'Sommer im Papierhaus',
    author: 'Elin Weber',
    genre: 'Familienroman',
    line: 'Eine Geschichte uber drei Generationen, alte Geheimnisse und einen Laden, der Menschen zusammenbringt.',
    palette: 'cover-garden',
  },
];

const bestsellerBooks = [
  ['Platz 1', 'Der Morgen gehort uns', 'Klara Brandt', 'cover-berry'],
  ['Platz 2', 'Kleine Wunder', 'Joris Feld', 'cover-garden'],
  ['Platz 3', 'Das Licht im Archiv', 'Nina Berg', 'cover-ocean'],
  ['Platz 4', 'Die Kunst des Wartens', 'Samir Okafor', 'cover-ink'],
];

const windowPicks = [
  { title: 'Krimis mit Lokalkolorit', badge: 'Thementisch', icon: BookOpenCheck },
  { title: 'Geschenke fur Lesenaechte', badge: 'Schon verpackt', icon: Sparkles },
  { title: 'Kinderbuecher fur Ferien', badge: 'Familienlieblinge', icon: Star },
];

const events = [
  { day: 'Heute', date: '19:30', title: 'Lesung mit Mara Linden', type: 'Noch wenige Plaetze' },
  { day: 'Sa', date: '15:00', title: 'Kinderbuchkino', type: 'Familienevent' },
  { day: 'Di', date: '18:00', title: 'Buchclub: Neue Stimmen', type: 'Offene Runde' },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

function BookCover({ book, rank, compact = false }) {
  const title = Array.isArray(book) ? book[1] : book.title;
  const author = Array.isArray(book) ? book[2] : book.author;
  const palette = Array.isArray(book) ? book[3] : book.palette;

  return (
    <div className={`book-cover ${palette} ${compact ? 'compact' : ''}`}>
      <div className="book-cover__shine" />
      {rank && <div className="book-cover__rank">{rank}</div>}
      <div className="book-cover__mark" />
      <div className="book-cover__title">{title}</div>
      <div className="book-cover__author">{author}</div>
    </div>
  );
}

function App() {
  const [activeBook, setActiveBook] = useState(0);
  const [activeEvent, setActiveEvent] = useState(0);
  const now = useClock();

  useEffect(() => {
    const bookTimer = window.setInterval(
      () => setActiveBook((index) => (index + 1) % featuredBooks.length),
      7200,
    );
    const eventTimer = window.setInterval(
      () => setActiveEvent((index) => (index + 1) % events.length),
      4800,
    );

    return () => {
      window.clearInterval(bookTimer);
      window.clearInterval(eventTimer);
    };
  }, []);

  const book = featuredBooks[activeBook];
  const clock = useMemo(
    () =>
      new Intl.DateTimeFormat('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(now),
    [now],
  );

  return (
    <main className="screen">
      <div className="window-glow" />
      <div className="shelf-art" aria-hidden="true">
        {Array.from({ length: 42 }).map((_, index) => (
          <span
            key={index}
            style={{
              '--delay': `${index * 0.12}s`,
              '--height': `${76 + ((index * 37) % 92)}px`,
            }}
          />
        ))}
      </div>

      <header className="topbar">
        <div className="brand">
          <Store size={28} aria-hidden="true" />
          <div>
            <p>Buchhandlung</p>
            <strong>Schaufenster</strong>
          </div>
        </div>
        <div className="status-row">
          <span className="status-pill">
            <Sparkles size={18} aria-hidden="true" />
            Jetzt neu dekoriert
          </span>
          <span className="clock">
            <Clock3 size={18} aria-hidden="true" />
            {clock}
          </span>
        </div>
      </header>

      <section className="hero" aria-label="Aktuelle Buchempfehlung">
        <div className="hero-copy" key={book.title}>
          <div className="section-label">
            <Flame size={22} aria-hidden="true" />
            {book.eyebrow}
          </div>
          <h1>{book.title}</h1>
          <p className="byline">{book.author} · {book.genre}</p>
          <p className="lead">{book.line}</p>
          <div className="hero-meta">
            <span>Im Laden ansehen</span>
            <span>Geschenkfertig verpackt</span>
            <span>Beratung am Tresen</span>
          </div>
        </div>

        <div className="hero-visual" key={`${book.title}-cover`}>
          <BookCover book={book} />
          <div className="book-shadow" />
        </div>
      </section>

      <aside className="window-picks" aria-label="Aktuelles Schaufenster">
        <div className="panel-heading">
          <Sparkles size={20} aria-hidden="true" />
          <span>Im Fenster</span>
        </div>
        {windowPicks.map(({ title, badge, icon: Icon }) => (
          <article className="pick-item" key={title}>
            <Icon size={24} aria-hidden="true" />
            <div>
              <p>{badge}</p>
              <strong>{title}</strong>
            </div>
          </article>
        ))}
      </aside>

      <section className="bottom-strip">
        <div className="bestseller" aria-label="Bestseller">
          <div className="strip-title">
            <Trophy size={22} aria-hidden="true" />
            Bestseller
          </div>
          <div className="book-row">
            {bestsellerBooks.map((item, index) => (
              <article className="mini-book" key={item[1]}>
                <BookCover book={item} compact rank={index + 1} />
                <div>
                  <span>{item[0]}</span>
                  <strong>{item[1]}</strong>
                  <p>{item[2]}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="events" aria-label="Veranstaltungen">
          <div className="strip-title">
            <CalendarDays size={22} aria-hidden="true" />
            Events
          </div>
          <div className="event-list">
            {events.map((event, index) => (
              <article
                className={`event-item ${activeEvent === index ? 'active' : ''}`}
                key={`${event.day}-${event.title}`}
              >
                <div className="event-date">
                  <span>{event.day}</span>
                  <strong>{event.date}</strong>
                </div>
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.type}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
