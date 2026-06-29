"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion as m, AnimatePresence as AP } from "framer-motion";
import { Calendar, MapPin, Users, Plus, X, Edit, Trash2, Globe, FileText, Check, Upload, Image as ImageIcon } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  date_start: string;
  date_end: string;
  location: string;
  capacity: number;
  free_for_members: boolean;
  is_published: boolean;
  banner_url: string | null;
}

interface EventsClientProps {
  initialEvents: Event[];
}

export default function EventsClient({ initialEvents }: EventsClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("workshop");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(50);
  const [freeForMembers, setFreeForMembers] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  // Helper to generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingEvent) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  };

  const openEditor = (event: Event | null = null) => {
    setErrorMsg("");
    if (event) {
      setEditingEvent(event);
      setTitle(event.title);
      setSlug(event.slug);
      setDescription(event.description);
      setCategory(event.category);
      setDateStart(new Date(event.date_start).toISOString().slice(0, 16));
      setDateEnd(new Date(event.date_end).toISOString().slice(0, 16));
      setLocation(event.location);
      setCapacity(event.capacity);
      setFreeForMembers(event.free_for_members);
      setIsPublished(event.is_published);
      setBannerUrl(event.banner_url);
    } else {
      setEditingEvent(null);
      setTitle("");
      setSlug("");
      setDescription("");
      setCategory("workshop");
      setDateStart("");
      setDateEnd("");
      setLocation("");
      setCapacity(50);
      setFreeForMembers(true);
      setIsPublished(false);
      setBannerUrl(null);
    }
    setEditorOpen(true);
  };

  // Upload banner file to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMsg("");

    const file = files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("event-banners")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("event-banners").getPublicUrl(filePath);
      setBannerUrl(data.publicUrl);
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setErrorMsg(err.message || "Failed to upload image. Make sure the 'event-banners' bucket exists and is public.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");

    const eventPayload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      category,
      date_start: new Date(dateStart).toISOString(),
      date_end: new Date(dateEnd).toISOString(),
      location: location.trim(),
      capacity: Number(capacity),
      free_for_members: freeForMembers,
      is_published: isPublished,
      banner_url: bannerUrl,
    };

    try {
      if (editingEvent) {
        // Update
        const { data, error } = await supabase
          .from("events")
          .update(eventPayload)
          .eq("id", editingEvent.id)
          .select()
          .single();

        if (error) throw error;

        setEvents(events.map((ev) => (ev.id === editingEvent.id ? data : ev)));
      } else {
        // Insert
        const { data, error } = await supabase
          .from("events")
          .insert([eventPayload])
          .select()
          .single();

        if (error) throw error;

        setEvents([data, ...events]);
      }
      setEditorOpen(false);
    } catch (err: any) {
      console.error("Error saving event:", err);
      setErrorMsg(err.message || "Failed to save event.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;

      setEvents(events.filter((ev) => ev.id !== id));
    } catch (err: any) {
      console.error("Error deleting event:", err);
      alert(err.message || "Failed to delete event.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Events</h1>
          <p className="text-sm text-ink/65">Create and manage your society events, hackathons, and seminars.</p>
        </div>
        <button
          onClick={() => openEditor(null)}
          className="inline-flex items-center gap-2 rounded-lg bg-wisteria px-4 py-2.5 text-sm font-semibold text-paper hover:bg-wisteria/90 active:scale-[0.99] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Event</span>
        </button>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="border border-dashed border-mist rounded-2xl p-16 text-center text-ink/50 bg-paper/30">
          <Calendar className="mx-auto h-12 w-12 text-ink/30 mb-4" />
          <h3 className="font-display text-lg font-bold text-ink">No events found</h3>
          <p className="text-sm text-ink/50 mt-1">Get started by creating your first society event!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="group border border-mist rounded-2xl bg-paper/30 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Event Image */}
              <div className="relative h-40 bg-wisteria-tint/30 flex items-center justify-center overflow-hidden">
                {event.banner_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.banner_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-wisteria/40" />
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="rounded bg-paper/90 backdrop-blur-xs px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-wisteria border border-mist">
                    {event.category}
                  </span>
                  {event.is_published ? (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-emerald-700 border border-emerald-100 flex items-center gap-1">
                      <Globe className="h-2.5 w-2.5" />
                      Live
                    </span>
                  ) : (
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-amber-700 border border-amber-100">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Event Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink group-hover:text-wisteria transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-xs text-ink/50 mt-1 font-mono">/{event.slug}</p>
                  <p className="text-sm text-ink/65 mt-3 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-mist space-y-2 text-xs text-ink/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-ink/30" />
                    <span>{formatDate(event.date_start)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-ink/30" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-ink/30" />
                    <span>Capacity: {event.capacity} seats</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-paper/50 border-t border-mist px-5 py-3 flex justify-between items-center">
                <button
                  onClick={() => openEditor(event)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink/75 hover:text-wisteria transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Event Editor Panel */}
      <AP>
        {editorOpen && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditorOpen(false)}
              className="fixed inset-0 z-40 bg-ink"
            />

            {/* Panel */}
            <m.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-paper border-l border-mist p-6 sm:p-8 shadow-2xl flex flex-col justify-between"
            >
              <form onSubmit={handleSave} className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-mist pb-4 mb-6">
                    <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-wisteria" />
                      {editingEvent ? "Edit Event" : "Create Event"}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditorOpen(false)}
                      className="rounded-lg p-1.5 text-ink/50 hover:bg-wisteria-tint hover:text-wisteria transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-800 border border-red-200">
                      {errorMsg}
                    </div>
                  )}

                  {/* Scrollable Form Body */}
                  <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1.5">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink/65 mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full rounded-lg border border-mist bg-paper px-3 py-2 text-sm focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria"
                        placeholder="e.g. Genesis Hackathon 2026"
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink/65 mb-1">URL Slug</label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full rounded-lg border border-mist bg-paper px-3 py-2 text-sm font-mono focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria"
                        placeholder="e.g. genesis-hackathon-2026"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink/65 mb-1">Description</label>
                      <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-lg border border-mist bg-paper px-3 py-2 text-sm focus:border-wisteria focus:outline-none focus:ring-1 focus:ring-wisteria leading-relaxed"
                        placeholder="Provide details about the event schedule, rules, and outcomes..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ink/65 mb-1">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-lg border border-mist bg-paper px-3 py-2 text-sm focus:border-wisteria focus:outline-none"
                        >
                          <option value="hackathon">Hackathon</option>
                          <option value="workshop">Workshop</option>
                          <option value="seminar">Seminar</option>
                          <option value="social">Social</option>
                        </select>
                      </div>

                      {/* Capacity */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ink/65 mb-1">Capacity</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={capacity}
                          onChange={(e) => setCapacity(Number(e.target.value))}
                          className="w-full rounded-lg border border-mist bg-paper px-3 py-2 text-sm focus:border-wisteria focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Date Start */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ink/65 mb-1">Start Date & Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={dateStart}
                          onChange={(e) => setDateStart(e.target.value)}
                          className="w-full rounded-lg border border-mist bg-paper px-3 py-2 text-sm focus:border-wisteria focus:outline-none"
                        />
                      </div>

                      {/* Date End */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ink/65 mb-1">End Date & Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={dateEnd}
                          onChange={(e) => setDateEnd(e.target.value)}
                          className="w-full rounded-lg border border-mist bg-paper px-3 py-2 text-sm focus:border-wisteria focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink/65 mb-1">Location</label>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-lg border border-mist bg-paper px-3 py-2 text-sm focus:border-wisteria focus:outline-none"
                        placeholder="e.g., Seminar Hall, Block C or Discord"
                      />
                    </div>

                    {/* Banner Image Uploader */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink/65 mb-2">Banner Image</label>
                      <div className="flex gap-4 items-center">
                        <div className="relative h-20 w-32 border border-mist bg-wisteria-tint/10 rounded-lg overflow-hidden flex items-center justify-center">
                          {bannerUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-wisteria/30" />
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="inline-flex items-center gap-2 rounded-lg border border-mist px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-wisteria-tint/25 hover:text-wisteria cursor-pointer transition-colors">
                            <Upload className="h-3.5 w-3.5" />
                            <span>{isUploading ? "Uploading..." : "Choose File"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploading}
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                          <p className="text-3xs text-ink/40 mt-1.5">Recommended ratio: 16:9. Size limit: 2MB.</p>
                        </div>
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex gap-6 pt-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-ink/80 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={freeForMembers}
                          onChange={(e) => setFreeForMembers(e.target.checked)}
                          className="rounded border-mist text-wisteria focus:ring-wisteria h-4.5 w-4.5"
                        />
                        <span>Free for Members</span>
                      </label>

                      <label className="flex items-center gap-2 text-sm font-semibold text-ink/80 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isPublished}
                          onChange={(e) => setIsPublished(e.target.checked)}
                          className="rounded border-mist text-wisteria focus:ring-wisteria h-4.5 w-4.5"
                        />
                        <span>Publish Event</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Panel */}
                <div className="border-t border-mist pt-6 flex gap-4 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setEditorOpen(false)}
                    className="rounded-lg border border-mist px-4 py-2.5 text-sm font-semibold text-ink/75 hover:bg-mist/30 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="inline-flex items-center gap-2 rounded-lg bg-wisteria px-5 py-2.5 text-sm font-semibold text-paper hover:bg-wisteria/90 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>{isSaving ? "Saving..." : "Save Event"}</span>
                  </button>
                </div>
              </form>
            </m.div>
          </>
        )}
      </AP>
    </div>
  );
}
