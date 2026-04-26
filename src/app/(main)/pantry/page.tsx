"use client"

import { useState, useEffect } from "react"
import {
  Plus, Trash2, Edit2, Check, X,
  ChefHat, Package, Sparkles, ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {useFetch} from "@/hooks/use-fetch"
import {
  getPantryItems,
  deletePantryItem,
  updatePantryItem,
} from "@/lib/actions/pantry.actions"
import { toast } from "sonner"
import AddToPantryModal from "@/components/AddToPantryModal"

// ─── Types ──────────────────────────────────────────────────
export type PantryItem = {
  id:        string
  name:      string
  quantity:  string | null
  unit:      string | null
  imageUrl:  string | null
  createdAt: Date
  updatedAt: Date
  userId:    string
}

export type PantryResult = {
  success: boolean
  items:   PantryItem[]
  isPro:   boolean
  error?:  string
}

// ─── Skeleton ───────────────────────────────────────────────
function PantryItemSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="h-5 bg-muted rounded w-2/3" />
      <div className="h-3 bg-muted rounded w-1/3" />
      <div className="h-3 bg-muted rounded w-1/4" />
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 gap-5 border-2 border-dashed border-border rounded-2xl bg-card">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Package className="w-10 h-10 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="font-serif text-2xl font-bold text-foreground">
          Your Pantry is Empty
        </h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          Start by scanning your pantry with AI or adding ingredients manually
          to discover amazing recipes!
        </p>
      </div>
      <Button
        onClick={onAdd}
        className="bg-primary hover:bg-primary/90 text-white rounded-full gap-2 shadow-[0_4px_16px_rgba(232,82,10,0.3)]"
        size="lg"
      >
        <Plus className="w-4 h-4" />
        Add Your First Item
      </Button>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────
export default function PantryPage() {
  const [items, setItems]             = useState<PantryItem[]>([])
  const [isPro, setIsPro]             = useState(false)
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [editValues, setEditValues]   = useState({ name: "", quantity: "" })
  const [isModalOpen, setIsModalOpen] = useState(false)

  // ── Fetch pantry items ─────────────────────────────────────
  const {
    loading: loadingItems,
    data: itemsData,
    fn: fetchItems,
  } = useFetch<PantryResult, []>(getPantryItems)

  // ── Delete item ────────────────────────────────────────────
  const {
    loading: deleting,
    data: deleteData,
    fn: deleteItem,
  } = useFetch(deletePantryItem)

  // ── Update item ────────────────────────────────────────────
  const {
    loading: updating,
    data: updateData,
    fn: updateItem,
  } = useFetch(updatePantryItem)

  // ── Load on mount ──────────────────────────────────────────
  useEffect(() => {
    fetchItems()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Handle fetched data ────────────────────────────────────
  useEffect(() => {
    if (!itemsData?.success) return
    setItems(itemsData.items)
    setIsPro(itemsData.isPro)
  }, [itemsData])

  // ── Handle delete ──────────────────────────────────────────
  useEffect(() => {
    if (!deleteData?.success || deleting) return
    toast.success("Item removed from pantry")
    fetchItems()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteData, deleting])

  // ── Handle update ──────────────────────────────────────────
  useEffect(() => {
    if (!updateData?.success) return
    toast.success("Item updated")
    setEditingId(null)
    fetchItems()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateData])

  // ── Handlers ───────────────────────────────────────────────
  const handleDelete = (itemId: string) => {
    const formData = new FormData()
    formData.append("itemId", itemId)
    deleteItem(formData)
  }

  const startEdit = (item: PantryItem) => {
    setEditingId(item.id)
    setEditValues({ name: item.name, quantity: item.quantity ?? "" })
  }

  const saveEdit = () => {
    if (!editingId) return
    const formData = new FormData()
    formData.append("itemId", editingId)
    formData.append("name", editValues.name)
    formData.append("quantity", editValues.quantity)
    updateItem(formData)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({ name: "", quantity: "" })
  }

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl font-black text-foreground tracking-tight">
              My Pantry
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage your ingredients and discover what you can cook
            </p>
          </div>
        </div>

        {/* Desktop Add Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="hidden sm:flex bg-primary hover:bg-primary/90 text-white rounded-full gap-2 shadow-[0_4px_16px_rgba(232,82,10,0.3)] hover:-translate-y-0.5 transition-all"
          size="lg"
        >
          <Plus className="w-4 h-4" />
          Add to Pantry
        </Button>
      </div>

      {/* Mobile Add Button */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden w-full bg-primary hover:bg-primary/90 text-white rounded-full gap-2"
        size="lg"
      >
        <Plus className="w-4 h-4" />
        Add to Pantry
      </Button>

      {/* ── Pro / Scan status strip ─────────────────────────── */}
      <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm">
        <Sparkles className="w-4 h-4 text-primary" />
        {isPro ? (
          <span className="text-muted-foreground">
            <span className="font-bold text-green-600">∞</span> Unlimited AI scans (Pro)
          </span>
        ) : (
          <span className="text-muted-foreground">
            Upgrade to{" "}
            <span className="font-semibold text-primary cursor-pointer hover:underline">
              Pro
            </span>{" "}
            for unlimited AI scans
          </span>
        )}
      </div>

      {/* ── What Can I Cook CTA ──────────────────────────────── */}
      {items.length > 0 && (
        <Link href="/pantry/recipes">
          <div className="bg-gradient-to-br from-green-600 to-emerald-500 text-white p-6 rounded-2xl border border-emerald-700 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <ChefHat className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl font-bold mb-0.5">
                  What Can I Cook Today?
                </h3>
                <p className="text-green-100 text-sm font-light">
                  Get AI-powered recipe suggestions from your{" "}
                  <span className="font-semibold">{items.length} ingredients</span>
                </p>
              </div>
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform hidden sm:block" />
            </div>
          </div>
        </Link>
      )}

      {/* ── Loading ──────────────────────────────────────────── */}
      {loadingItems && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <PantryItemSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Items Grid ───────────────────────────────────────── */}
      {!loadingItems && items.length > 0 && (
        <div className="space-y-4">
          {/* Count */}
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Your Ingredients
            </h2>
            <Badge
              variant="outline"
              className="border-border text-muted-foreground font-semibold"
            >
              {items.length} {items.length === 1 ? "item" : "items"}
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all"
              >
                {editingId === item.id ? (
                  // ── Edit Mode ──────────────────────────────
                  <div className="space-y-3">
                    <Input
                      value={editValues.name}
                      onChange={(e) =>
                        setEditValues({ ...editValues, name: e.target.value })
                      }
                      placeholder="Ingredient name"
                      className="rounded-xl border-border focus:border-primary text-sm"
                    />
                    <Input
                      value={editValues.quantity}
                      onChange={(e) =>
                        setEditValues({ ...editValues, quantity: e.target.value })
                      }
                      placeholder="Quantity (e.g. 2 cups)"
                      className="rounded-xl border-border focus:border-primary text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={saveEdit}
                        disabled={updating}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                      >
                        {updating ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={updating}
                        className="flex-1 rounded-xl border-border hover:border-foreground"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  // ── View Mode ──────────────────────────────
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate capitalize">
                          {item.name}
                        </h3>
                        {item.quantity && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {item.quantity}
                            {item.unit ? ` ${item.unit}` : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2 flex-shrink-0">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          aria-label="Edit item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────── */}
      {!loadingItems && items.length === 0 && (
        <EmptyState onAdd={() => setIsModalOpen(true)} />
      )}

      {/* ── Modal ─────────────────────────────────────────────── */}
      <AddToPantryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchItems()}
      />
    </div>
  )
}