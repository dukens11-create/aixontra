import Link from 'next/link';

const rooms = [
  { id: 'room-1', title: 'Neon Camp Session', status: 'in_progress', members: 4, split: '50/30/20' },
  { id: 'room-2', title: 'Kompa Future Jam', status: 'draft', members: 3, split: '40/40/20' },
];

export default function CollaborationRoomsPage() {
  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5"><h1>Collaboration Rooms</h1><p className="muted">Invite collaborators, co-write lyrics, track ideas, comments, versions, and royalty splits.</p></section>
      <section className="card bg-white/5">
        <div className="row"><input className="input max-w-sm" placeholder="New room title" /><button className="btn">Create room</button></div>
      </section>
      {rooms.map((room) => (
        <article key={room.id} className="card bg-black/30">
          <div className="row justify-between"><h3>{room.title}</h3><span className="badge">{room.status}</span></div>
          <p className="muted">{room.members} collaborators · Royalty split {room.split}</p>
          <textarea className="textarea mt-3" defaultValue="Shared lyrics editor placeholder..." />
          <textarea className="textarea mt-3" placeholder="Idea board notes..." />
          <div className="row mt-3"><button className="badge">Invite collaborator</button><button className="badge">Add audio version</button><button className="badge">Comment</button></div>
          <Link href="#" className="badge mt-3 inline-flex">Open room details</Link>
        </article>
      ))}
    </div>
  );
}
