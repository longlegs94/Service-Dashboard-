import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dollarsToCents, formatCents } from "@/utils/money";

/** A line item as edited in the form: price is held as a dollar STRING here. */
export interface DraftItem {
  description: string;
  quantity: string;
  unitPriceDollars: string;
  taxable: boolean;
}

export function emptyDraftItem(): DraftItem {
  return { description: "", quantity: "1", unitPriceDollars: "", taxable: true };
}

export function LineItemsEditor({
  items,
  onChange,
  currency = "CAD",
}: {
  items: DraftItem[];
  onChange: (items: DraftItem[]) => void;
  currency?: string;
}) {
  function update(index: number, patch: Partial<DraftItem>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...items, emptyDraftItem()]);
  }

  return (
    <div className="space-y-3">
      <Label>Line items</Label>
      {items.map((item, index) => {
        const qty = Number.parseFloat(item.quantity) || 0;
        const cents = dollarsToCents(item.unitPriceDollars);
        const lineTotal = Math.round(cents * qty);
        return (
          <div
            key={index}
            className="space-y-2 rounded-md border p-3"
          >
            <Input
              value={item.description}
              onChange={(e) => update(index, { description: e.target.value })}
              placeholder="Description (e.g. Service call, parts)"
            />
            <div className="flex items-end gap-2">
              <div className="w-16 shrink-0 space-y-1">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => update(index, { quantity: e.target.value })}
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Unit price</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={item.unitPriceDollars}
                  onChange={(e) =>
                    update(index, { unitPriceDollars: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                aria-label="Remove line item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={item.taxable}
                  onChange={(e) => update(index, { taxable: e.target.checked })}
                />
                Taxable
              </label>
              <span className="text-sm font-medium tabular-nums">
                {formatCents(lineTotal, currency)}
              </span>
            </div>
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={add} className="w-full">
        <Plus className="h-4 w-4" /> Add line item
      </Button>
    </div>
  );
}

/** Converts draft items (dollar strings) into the cents-based service shape. */
export function draftItemsToInput(items: DraftItem[]) {
  return items
    .filter((it) => it.description.trim() !== "")
    .map((it) => ({
      description: it.description,
      quantity: Number.parseFloat(it.quantity) || 0,
      unit_price_cents: dollarsToCents(it.unitPriceDollars),
      taxable: it.taxable,
    }));
}
