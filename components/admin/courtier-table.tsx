"use client"

import { useState } from "react"
import type { CourtierResponse } from "@/lib/courtier-db"
import { courtierQuestions, type ReviewStatus } from "@/lib/courtiers"
import { EMPTY_VALUE, formatDate, formatDateTime, timestampValue } from "@/lib/format"
import { CourtierReview } from "@/components/courtier-review"
import { DataTable, type DataTableColumn, type DataTableDetail } from "./data-table"
import { DetailAnswer, DetailAnswers, DetailFact, DetailFacts, DetailLink, DetailSection, DetailTags } from "./detail-parts"
import { PersonCell } from "./person-cell"
import { StatusBadge, type StatusTone } from "./status-badge"

const statusTone: Record<ReviewStatus, StatusTone> = { pending: "warning", accepted: "success", declined: "danger" }

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return <StatusBadge tone={statusTone[status]} dot className="capitalize">{status}</StatusBadge>
}

function SkillsPreview({ skills }: { skills: string[] }) {
  const shown = skills.slice(0, 2)
  const hidden = skills.length - shown.length
  return (
    <span className="flex max-w-[24rem] flex-wrap items-center gap-1.5">
      {shown.map((skill) => (
        <span key={skill} title={skill} className="max-w-[14rem] truncate rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-foreground">{skill}</span>
      ))}
      {hidden > 0 && <span className="text-xs text-muted-foreground">+{hidden} more</span>}
    </span>
  )
}

const columns: DataTableColumn<CourtierResponse>[] = [
  { id: "applicant", header: "Applicant", sortValue: (application) => application.full_name,
    cell: (application) => <PersonCell name={application.full_name} subtitle={application.email} /> },
  { id: "skills", header: "Skills offered", className: "hidden xl:table-cell", cell: (application) => <SkillsPreview skills={application.skills} /> },
  { id: "status", header: "Decision", sortValue: (application) => application.status, cell: (application) => <ReviewStatusBadge status={application.status} /> },
  { id: "applied", header: "Applied", className: "hidden whitespace-nowrap sm:table-cell", sortValue: (application) => timestampValue(application.created_at),
    cell: (application) => <span className="text-muted-foreground">{formatDate(application.created_at)}</span> },
  { id: "reviewed", header: "Reviewed", className: "hidden whitespace-nowrap 2xl:table-cell", sortValue: (application) => timestampValue(application.reviewed_at),
    cell: (application) => <span className="text-muted-foreground">{application.reviewed_at ? formatDate(application.reviewed_at) : "Not yet"}</span> },
]

const searchText = (application: CourtierResponse) =>
  [application.full_name, application.email, application.status, application.portfolio, ...application.skills, ...Object.values(application.answers)].join(" ")

function CourtierDetail({ application, onSaved }: { application: CourtierResponse; onSaved: (status: ReviewStatus) => void }) {
  return (
    <>
      <DetailSection title="Application">
        <DetailFacts>
          <DetailFact label="Applied">{formatDateTime(application.created_at)}</DetailFact>
          <DetailFact label="Portfolio / work sample">
            {application.portfolio ? <DetailLink href={application.portfolio} /> : <span className="text-muted-foreground">Not provided</span>}
          </DetailFact>
        </DetailFacts>
      </DetailSection>
      <DetailSection title="Skills offered">
        <DetailTags items={application.skills} />
      </DetailSection>
      <DetailSection title="Evaluation answers">
        <DetailAnswers>
          {courtierQuestions.map((question) => (
            <DetailAnswer key={question.id} label={question.label} value={application.answers[question.id]} />
          ))}
        </DetailAnswers>
      </DetailSection>
      <DetailSection title="Commitment">
        <p className="text-sm text-muted-foreground">
          Acknowledged unpaid service, self-funded access, and preparation / arrival / departure commitments.
          This is self-declared, not proof of ticket payment.
        </p>
      </DetailSection>
      <DetailSection title="Manual review">
        <p className="text-sm text-muted-foreground">
          {application.reviewed_at
            ? <>Last reviewed by {application.reviewed_by ?? EMPTY_VALUE} on {formatDateTime(application.reviewed_at)}.</>
            : "Not reviewed yet."}
        </p>
        <CourtierReview key={`${application.id}-${application.version}`} id={application.id} status={application.status}
          notes={application.review_notes} version={application.version} onSaved={onSaved} />
      </DetailSection>
    </>
  )
}

export function CourtierTable({ applications }: { applications: CourtierResponse[] }) {
  // The form remounts after each save and the row may leave the active filter, so the confirmation lives here.
  const [notice, setNotice] = useState("")
  const detail: DataTableDetail<CourtierResponse> = {
    title: (application) => application.full_name,
    description: (application) => (
      <a href={`mailto:${application.email}`} className="text-accent-bright underline-offset-4 hover:underline">{application.email}</a>
    ),
    badge: (application) => <ReviewStatusBadge status={application.status} />,
    content: (application) => (
      <CourtierDetail application={application} onSaved={(status) => setNotice(`Saved ${application.full_name} as ${status}.`)} />
    ),
  }

  return (
    <div className="space-y-4">
      {notice && (
        <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">{notice}</p>
      )}
      <DataTable
        caption="Wealth Courtier applications"
        rows={applications}
        columns={columns}
        getRowId={(application) => application.id}
        searchText={searchText}
        searchPlaceholder="Search this page…"
        searchLabel="Search applications on this page by name, email, skill, or answer"
        emptyMessage="No applications on this page."
        detail={detail}
      />
    </div>
  )
}
