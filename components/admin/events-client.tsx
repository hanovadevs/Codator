"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion as m, AnimatePresence as AP } from "framer-motion";
import { Calendar, MapPin, Users, Plus, X, Edit, Trash2, Globe, FileText, Check, Upload, Image as ImageIcon, Loader2, Search, CheckCircle, Mail } from "lucide-react";

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

interface EventRegistration {
  id: string;
  registered_at: string;
  checked_in_at: string | null;
  members: {
    id: string;
    full_name: string;
    email: string;
    codator_id: string | null;
  } | {
    id: string;
    full_name: string;
    email: string;
    codator_id: string | null;
  }[] | null;
}

interface ActiveMember {
  id: string;
  full_name: string;
  email: string;
  codator_id: string | null;
}

function generateRandomFileName(fileExt: string): string {
  return `${Math.random().toString(36).substring(2)}.${fileExt}`;
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

  // Search, Filters & Blast States
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [emailNotificationResult, setEmailNotificationResult] = useState<{ sent: number; total: number } | null>(null);

  const supabase = createClient();

  // Registrations panel states
  const [selectedEventForRegs, setSelectedEventForRegs] = useState<Event | null>(null);
  const [registrationsList, setRegistrationsList] = useState<EventRegistration[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [allActiveMembers, setAllActiveMembers] = useState<ActiveMember[]>([]);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");

  const fetchEventRegistrations = async (eventId: string) => {
    setRegLoading(true);
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          id,
          registered_at,
          checked_in_at,
          members (
            id,
            full_name,
            email,
            codator_id
          )
        `)
        .eq("event_id", eventId)
        .order("registered_at", { ascending: false });

      if (error) throw error;
      setRegistrationsList(data || []);
    } catch (err) {
      console.error("Error fetching event registrations:", err);
    } finally {
      setRegLoading(false);
    }
  };

  const fetchActiveMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("id, full_name, email, codator_id")
        .eq("status", "active")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setAllActiveMembers(data || []);
    } catch (err) {
      console.error("Error fetching active members:", err);
    }
  };

  const handleToggleAttendance = async (regId: string, currentCheckedInAt: string | null) => {
    const newCheckedInAt = currentCheckedInAt ? null : new Date().toISOString();
    try {
      const { error } = await supabase
        .from("event_registrations")
        .update({ checked_in_at: newCheckedInAt })
        .eq("id", regId);

      if (error) throw error;

      setRegistrationsList((prev) =>
        prev.map((reg) => (reg.id === regId ? { ...reg, checked_in_at: newCheckedInAt } : reg))
      );
    } catch (err) {
      console.error("Error toggling attendance:", err);
      alert("Failed to update attendance.");
    }
  };

  const handleManualRegister = async (memberId: string) => {
    if (!selectedEventForRegs) return;
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .insert([
          {
            event_id: selectedEventForRegs.id,
            member_id: memberId,
          },
        ])
        .select(`
          id,
          registered_at,
          checked_in_at,
          members (
            id,
            full_name,
            email,
            codator_id
          )
        `)
        .single();

      if (error) {
        if (error.code === "23505") {
          alert("This member is already registered.");
        } else {
          throw error;
        }
        return;
      }

      setRegistrationsList((prev) => [data as EventRegistration, ...prev]);
      setSearchMemberQuery("");
    } catch (err) {
      console.error("Error manually registering member:", err);
      alert("Failed to register member.");
    }
  };

  const handleManualDeregister = async (regId: string) => {
    if (!confirm("Are you sure you want to remove this registration?")) return;
    try {
      const { error } = await supabase.from("event_registrations").delete().eq("id", regId);
      if (error) throw error;
      setRegistrationsList((prev) => prev.filter((reg) => reg.id !== regId));
    } catch (err) {
      console.error("Error removing registration:", err);
      alert("Failed to remove registration.");
    }
  };

  const openRegistrations = (event: Event) => {
    setSelectedEventForRegs(event);
    fetchEventRegistrations(event.id);
    fetchActiveMembers();
  };

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

  // Convert banner file to Base64 Data URL to bypass storage RLS configuration issues
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMsg("");

    const file = files[0];
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg("Image file size should be less than 3MB.");
      setIsUploading(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setErrorMsg("Failed to read image file.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error processing file:", err);
      setErrorMsg("Failed to process image file.");
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    setEmailNotificationResult(null);

    const eventPayload = {
      id: editingEvent?.id || null,
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      category,
      date_start: new Date(dateStart).toISOString(),
      date_end: dateEnd ? new Date(dateEnd).toISOString() : null,
      location: location.trim(),
      capacity: Number(capacity),
      free_for_members: freeForMembers,
      is_published: isPublished,
      banner_url: bannerUrl,
    };

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save event");

      if (editingEvent) {
        setEvents(events.map((ev) => (ev.id === editingEvent.id ? data.event : ev)));
      } else {
        setEvents([data.event, ...events]);
      }

      if (data.published && data.emailsTotal > 0) {
        setEmailNotificationResult({
          sent: data.emailsSent || 0,
          total: data.emailsTotal || 0,
        });
      }

      setEditorOpen(false);
    } catch (err) {
      console.error("Error saving event:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to save event.");
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
    } catch (err) {
      console.error("Error deleting event:", err);
      alert(err instanceof Error ? err.message : "Failed to delete event.");
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

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || ev.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const stats = {
    total: events.length,
    published: events.filter((e) => e.is_published).length,
    drafts: events.filter((e) => !e.is_published).length,
    hackathons: events.filter((e) => e.category.toLowerCase() === "hackathon").length,
    workshops: events.filter((e) => e.category.toLowerCase() === "workshop").length,
  };

  return (
    <div className="relative text-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-ink flex items-center gap-2">
            <Calendar className="h-6 w-6 text-wisteria animate-pulse" />
            Events Board
          </h1>
          <p className="text-3xs text-ink/55 font-semibold">
            Create, manage, and schedule society events. Registered members receive email notifications when events are published.
          </p>
        </div>
        <button
          onClick={() => { openEditor(null); setEmailNotificationResult(null); }}
          className="inline-flex items-center gap-2 rounded-xl bg-wisteria px-5 py-2.5 text-4xs font-bold text-paper hover:bg-wisteria/90 active:scale-[0.98] transition-all cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Event</span>
        </button>
      </div>

      {/* Email Send Success Toast */}
      <AP>
        {emailNotificationResult && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 backdrop-blur-sm"
          >
            <div className="rounded-full bg-emerald-100 p-2 border border-emerald-200">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <span className="text-4xs font-bold text-[#1D1B26] block">Event Published & Blast Complete</span>
              <span className="text-[10px] font-semibold text-emerald-600">
                <Mail className="h-3 w-3 inline mr-0.5" />
                {emailNotificationResult.sent} of {emailNotificationResult.total} members notified via email
              </span>
            </div>
            <button onClick={() => setEmailNotificationResult(null)} className="text-emerald-400 hover:text-emerald-600 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </m.div>
        )}
      </AP>

      {/* Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Total Events", value: stats.total, color: "#8B7FE8" },
          { label: "Published", value: stats.published, color: "#10b981" },
          { label: "Drafts", value: stats.drafts, color: "#f59e0b" },
          { label: "Hackathons", value: stats.hackathons, color: "#ec4899" },
          { label: "Workshops", value: stats.workshops, color: "#8b5cf6" },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-mist rounded-xl p-3.5 bg-white/30 flex items-center gap-3"
          >
            <span className="font-display text-xl font-black" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="text-[9px] font-bold text-ink/40 uppercase tracking-widest">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/30" />
          <input
            type="text"
            placeholder="Search events by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-4xs font-semibold border border-mist bg-white/50 rounded-xl focus:border-wisteria outline-none transition-all placeholder:text-ink/30"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap bg-[#F8F8FC] border border-mist/55 p-1 rounded-xl shrink-0">
          {["all", "hackathon", "workshop", "seminar", "social"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer capitalize ${
                categoryFilter === cat
                  ? "bg-white text-wisteria shadow-sm border border-mist/40"
                  : "text-ink/50 hover:text-ink"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="border border-dashed border-mist rounded-3xl p-16 text-center text-ink/50 bg-white/30">
          <Calendar className="mx-auto h-12 w-12 text-ink/25 mb-4 animate-pulse" />
          <h3 className="font-display text-base font-bold text-ink">
            {events.length === 0 ? "No events found" : "No matching events found"}
          </h3>
          <p className="text-4xs text-ink/50 mt-1">
            {events.length === 0
              ? "Get started by creating your first society event!"
              : "Try adjusting your search query or filter category."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
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
              <div className="bg-paper/50 border-t border-mist px-5 py-3 flex justify-between items-center gap-2">
                <button
                  onClick={() => openEditor(event)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink/75 hover:text-wisteria transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => openRegistrations(event)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-wisteria hover:underline transition-colors"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Registrations</span>
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

      {/* Slide-over Registrations Panel */}
      <AP>
        {selectedEventForRegs && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEventForRegs(null)}
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
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-mist pb-4 mb-6">
                    <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                      <Users className="h-5 w-5 text-wisteria" />
                      <span>Registrations: {selectedEventForRegs.title}</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSelectedEventForRegs(null)}
                      className="rounded-lg p-1.5 text-ink/50 hover:bg-wisteria-tint hover:text-wisteria transition-colors cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Add Member Registration Area */}
                  <div className="mb-6 p-4 bg-wisteria-tint/15 border border-wisteria/10 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-ink">Register Member On-the-spot</h4>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search active members by name..."
                        value={searchMemberQuery}
                        onChange={(e) => setSearchMemberQuery(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-paper border border-mist rounded-xl focus:outline-none focus:border-wisteria"
                      />
                      {searchMemberQuery && (
                        <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-paper border border-mist rounded-xl shadow-lg z-50 divide-y divide-mist">
                          {allActiveMembers
                            .filter((m) =>
                              m.full_name.toLowerCase().includes(searchMemberQuery.toLowerCase()) &&
                              !registrationsList.some((reg) => {
                                const regMember = Array.isArray(reg.members) ? reg.members[0] : reg.members;
                                return regMember?.id === m.id;
                              })
                            )
                            .slice(0, 5)
                            .map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => handleManualRegister(m.id)}
                                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-wisteria-tint/10 flex justify-between items-center"
                              >
                                <span>{m.full_name} ({m.codator_id || "No ID"})</span>
                                <span className="text-5xs text-wisteria font-bold">Register →</span>
                              </button>
                            ))}
                          {allActiveMembers.filter((m) =>
                            m.full_name.toLowerCase().includes(searchMemberQuery.toLowerCase()) &&
                            !registrationsList.some((reg) => {
                              const regMember = Array.isArray(reg.members) ? reg.members[0] : reg.members;
                              return regMember?.id === m.id;
                            })
                          ).length === 0 && (
                            <div className="px-3 py-2 text-xs text-ink/50 italic">No matching unregistered members found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Registrations List */}
                  <h4 className="text-xs font-bold text-ink mb-3">Registered Members ({registrationsList.length})</h4>
                  <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1.5">
                    {regLoading ? (
                      <div className="flex items-center gap-2 text-ink/50 py-10 justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-wisteria" />
                        <span>Loading registrations...</span>
                      </div>
                    ) : registrationsList.length === 0 ? (
                      <div className="text-center py-10 text-xs text-ink/50 italic">
                        No registrations logged for this event.
                      </div>
                    ) : (
                      registrationsList.map((reg) => {
                        const member = Array.isArray(reg.members) ? reg.members[0] : reg.members;
                        if (!member) return null;
                        const isCheckedIn = !!reg.checked_in_at;

                        return (
                          <div key={reg.id} className="flex items-center justify-between p-3 bg-paper border border-mist/80 rounded-2xl hover:border-wisteria/30 transition-colors">
                            <div className="max-w-[60%]">
                              <span className="block font-bold text-ink truncate">{member.full_name}</span>
                              <span className="block text-5xs text-ink/50 font-mono mt-0.5">{member.codator_id || "NO ID"} • {member.email}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleAttendance(reg.id, reg.checked_in_at)}
                                className={`text-5xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                  isCheckedIn
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                }`}
                              >
                                {isCheckedIn ? "Checked In" : "Check In"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleManualDeregister(reg.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                                title="Remove registration"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="border-t border-mist pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedEventForRegs(null)}
                    className="w-full rounded-xl border border-mist py-2.5 text-xs font-bold text-ink hover:bg-mist/30 transition-colors cursor-pointer text-center"
                  >
                    Close
                  </button>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AP>
    </div>
  );
}
