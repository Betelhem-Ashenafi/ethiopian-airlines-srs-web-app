"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Report } from "@/lib/data"
  const handleSave = () => {
    // In a real app, you would send these updates to your backend
    console.log("Saving updates for report:", report.id)
    console.log("New Status:", currentStatus)
    console.log("New Department:", currentDepartment)
    console.log("New Severity:", currentSeverity)
    console.log("New Assigned To:", currentAssignedTo)
    if (newComment) {
      console.log("New Comment:", newComment)
    }
  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mt-2"
                  disabled={isEmployee}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleSave} disabled={isEmployee}>
                Save Changes
              </Button>
              <Button
                onClick={() => {
                  if (newComment.trim()) {
                    setNewComment("");
                    alert("Comment sent!");
                  }
                }}
                disabled={isEmployee || !newComment.trim()}
              >
                Send Comment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    }

