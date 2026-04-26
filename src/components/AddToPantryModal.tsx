"use client"

import { useState, useEffect } from "react"
import { Camera, Plus, X, Check, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ImageUploader from "@/components/ImageUploader"
import {useFetch }from "@/hooks/use-fetch"
import {
  scanPantryImage,
  saveToPantry,
  addPantryItemManually,
} from "@/lib/actions/pantry.actions"
import { toast } from "sonner"

// ─── Types ──────────────────────────────────────────────────
type ScannedIngredient = {
  name:        string
  quantity:    string
  confidence?: number
}

type Props = {
  isOpen:    boolean
  onClose:   () => void
  onSuccess: () => void
}

// ─── Main Component ──────────────────────────────────────────
export default function AddToPantryModal({ isOpen, onClose, onSuccess }: Props) {
  const [activeTab,           setActiveTab]           = useState<"scan" | "manual">("scan")
  const [selectedImage,       setSelectedImage]       = useState<File | null>(null)
  const [scannedIngredients,  setScannedIngredients]  = useState<ScannedIngredient[]>([])
  const [manualItem,          setManualItem]          = useState({ name: "", quantity: "" })

  // ── Hooks ──────────────────────────────────────────────────
  const { loading: scanning, data: scanData,  fn: scanImage        } = useFetch(scanPantryImage)
  const { loading: saving,   data: saveData,  fn: saveScannedItems } = useFetch(saveToPantry)
  const { loading: adding,   data: addData,   fn: addManualItem    } = useFetch(addPantryItemManually)
  const [scanError, setScanError] = useState<string | null>(null)
  // ── Handle scan result ─────────────────────────────────────
  useEffect(() => {
    if (scanData === undefined) return // wait for scan to complete

    if (!scanData?.success) {
      // Show error to user — rate limited gets special message
      if (scanData?.rateLimited) {
        toast.error(scanData.error, {
          description: "Upgrade to Pro for more scans",
          duration: 5000,
        })
      } else {
        setScanError(scanData?.error ?? "Failed to scan image")
        toast.error(scanData?.error ?? "Failed to scan image")
      }
      return
    }

    if (scanData.ingredients?.length === 0) {
      toast.error("No ingredients detected", {
        description: "Try a clearer photo with better lighting",
      })
      return
    }
    setScanError(null)
    setScannedIngredients(scanData.ingredients ?? [])
    toast.success(`Found ${scanData.ingredients?.length} ingredients!`)
  }, [scanData]) 

// ── Handle save scanned success/error ──────────────────────
  useEffect(() => {
    if (saveData === undefined) return
    if (!saveData?.success) {
      toast.error(saveData?.error ?? "Failed to save items")
      return
    }
    toast.success(`Saved ${saveData.count} items to pantry!`)
    handleClose()
    onSuccess()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveData])

  // ── Handle manual add success/error ────────────────────────
  useEffect(() => {
    if (addData === undefined) return
    if (!addData?.success) {
      toast.error(addData?.error ?? "Failed to add item")
      return
    }
    toast.success("Item added to pantry!")
    setManualItem({ name: "", quantity: "" })
    handleClose()
    onSuccess()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addData])

  // ── Handlers ───────────────────────────────────────────────
  const handleScan = () => {
    if (!selectedImage) return
    const formData = new FormData()
    formData.append("image", selectedImage)
    scanImage(formData)
  }

  const handleSaveScanned = () => {
    if (scannedIngredients.length === 0) {
      toast.error("No ingredients to save")
      return
    }
    const formData = new FormData()
    formData.append("ingredients", JSON.stringify(scannedIngredients))
    saveScannedItems(formData)
  }

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualItem.name.trim()) {
      toast.error("Ingredient name is required")
      return
    }
    const formData = new FormData()
    formData.append("name",     manualItem.name)
    formData.append("quantity", manualItem.quantity)
    addManualItem(formData)
  }

  const removeIngredient = (index: number) => {
    setScannedIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClose = () => {
    setActiveTab("scan")
    setSelectedImage(null)
    setScannedIngredients([])
    setManualItem({ name: "", quantity: "" })
    onClose()
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold text-foreground tracking-tight">
            Add to Pantry
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Scan your pantry with AI or add items manually
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "scan" | "manual")}
          className="mt-2"
        >
          {/* Tab Switcher */}
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="scan" className="gap-2 rounded-lg">
              <Camera className="w-4 h-4" />
              AI Scan
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2 rounded-lg">
              <Plus className="w-4 h-4" />
              Add Manually
            </TabsTrigger>
          </TabsList>

          {/* ── AI Scan Tab ─────────────────────────────────── */}
          <TabsContent value="scan" className="space-y-5 mt-5">

            {scannedIngredients.length === 0 ? (
              // Step 1 — Upload image
              <div className="space-y-4">
                <ImageUploader
                  onImageSelect={setSelectedImage}
                  loading={scanning}
                />
                {selectedImage && !scanning && (
                  <Button
                    onClick={handleScan}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12 text-base gap-2 shadow-[0_4px_16px_rgba(232,82,10,0.3)]"
                  >
                    <Camera className="w-5 h-5" />
                    Scan Image
                  </Button>
                )}
                {scanning && (
                  <div className="flex items-center justify-center gap-3 py-3 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Analysing your pantry...
                  </div>
                )}
                {scanError !== null && scanError !== "" && !scanning &&  (
                  <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-destructive">
                        Scan Failed
                      </p>
                      <p className="text-sm text-destructive/80 mt-0.5">
                        {scanError}
                      </p>
                    </div>
                    <button
                      onClick={() => setScanError(null)}
                      className="text-destructive/60 hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Step 2 — Review scanned ingredients
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Review Detected Items
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {scannedIngredients.length} ingredients found
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setScannedIngredients([])
                      setSelectedImage(null)
                    }}
                    className="rounded-full border-border hover:border-primary hover:text-primary gap-1.5 text-xs"
                  >
                    <Camera className="w-3 h-3" />
                    Scan Again
                  </Button>
                </div>

                {/* Ingredients list */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {scannedIngredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3.5 bg-secondary border border-border rounded-xl"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate capitalize">
                          {ingredient.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ingredient.quantity}
                        </p>
                      </div>

                      {/* Confidence badge */}
                      {ingredient.confidence && (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-700 border-green-200 bg-green-50 flex-shrink-0"
                        >
                          {Math.round(ingredient.confidence * 100)}%
                        </Badge>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={() => removeIngredient(index)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                        aria-label="Remove ingredient"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Save button */}
                <Button
                  onClick={handleSaveScanned}
                  disabled={saving || scannedIngredients.length === 0}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12 gap-2 shadow-[0_4px_16px_rgba(232,82,10,0.3)]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save {scannedIngredients.length} Items to Pantry
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ── Manual Add Tab ──────────────────────────────── */}
          <TabsContent value="manual" className="mt-5">
            <form onSubmit={handleAddManual} className="space-y-4">

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Ingredient Name
                </label>
                <Input
                  value={manualItem.name}
                  onChange={(e) =>
                    setManualItem({ ...manualItem, name: e.target.value })
                  }
                  placeholder="e.g. Chicken breast, Tomatoes, Onion"
                  className="rounded-xl border-border focus:border-primary h-11"
                  disabled={adding}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Quantity{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  value={manualItem.quantity}
                  onChange={(e) =>
                    setManualItem({ ...manualItem, quantity: e.target.value })
                  }
                  placeholder="e.g. 500g, 2 cups, 3 pieces"
                  className="rounded-xl border-border focus:border-primary h-11"
                  disabled={adding}
                />
              </div>

              <Button
                type="submit"
                disabled={adding || !manualItem.name.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12 gap-2 shadow-[0_4px_16px_rgba(232,82,10,0.3)]"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Pantry
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}