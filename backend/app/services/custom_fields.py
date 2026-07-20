"""Dynamic custom-fields: spec model + answer validation (§5.1/§5.2).

An event defines `custom_fields` as a list of {label, type, required, options}.
At registration time each answer is validated against that spec. Validation is
data-driven (the event author decides the questions), so we build the checks at
runtime rather than from a fixed Pydantic model.
"""
from __future__ import annotations

import enum
import re
from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
# Lenient international phone: optional +, digits/spaces/hyphens, 7–15 digits.
_TEL_RE = re.compile(r"^\+?[0-9][0-9\s\-]{5,18}[0-9]$")

MAX_TEXT_LEN = 1000


class CustomFieldType(str, enum.Enum):
    text = "text"
    select = "select"
    tel = "tel"
    email = "email"


class CustomFieldSpec(BaseModel):
    """One admin-defined question on an event's registration form."""

    label: str = Field(min_length=1, max_length=100)
    type: CustomFieldType = CustomFieldType.text
    required: bool = False
    options: list[str] | None = None

    @field_validator("label")
    @classmethod
    def _clean_label(cls, v: str) -> str:
        return v.strip()

    @model_validator(mode="after")
    def _check_options(self) -> "CustomFieldSpec":
        if self.type is CustomFieldType.select:
            opts = [o.strip() for o in (self.options or []) if o.strip()]
            if not opts:
                raise ValueError(f"select field '{self.label}' requires non-empty options")
            self.options = opts
        else:
            self.options = None
        return self


def validate_field_specs(raw: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
    """Validate/normalise an event's custom_fields definition. Raises ValueError
    (via Pydantic) on a malformed spec. Returns plain dicts ready for JSON storage.
    Duplicate labels are rejected — answers are keyed by label.
    """
    if not raw:
        return []
    specs = [CustomFieldSpec.model_validate(item) for item in raw]
    labels = [s.label for s in specs]
    dupes = {lab for lab in labels if labels.count(lab) > 1}
    if dupes:
        raise ValueError(f"duplicate custom-field labels: {', '.join(sorted(dupes))}")
    return [s.model_dump(mode="json") for s in specs]


class CustomFieldsError(Exception):
    """Raised when submitted answers don't satisfy the event's field spec.

    `errors` maps field label -> human-readable message.
    """

    def __init__(self, errors: dict[str, str]):
        self.errors = errors
        super().__init__("custom field validation failed")


def validate_answers(
    specs: list[dict[str, Any]] | None,
    answers: dict[str, Any] | None,
) -> dict[str, Any]:
    """Validate submitted `answers` against the event's `specs`.

    - required fields must be present and non-empty
    - select answers must be one of the declared options
    - email/tel answers must match a basic format
    - unknown keys (not in the spec) are dropped
    Returns the cleaned answers (only known fields, trimmed). Raises
    CustomFieldsError with per-field messages on any violation.
    """
    specs = specs or []
    answers = answers or {}
    cleaned: dict[str, Any] = {}
    errors: dict[str, str] = {}

    for spec in specs:
        label = spec["label"]
        ftype = spec.get("type", "text")
        required = bool(spec.get("required", False))
        raw = answers.get(label)
        value = raw.strip() if isinstance(raw, str) else raw

        if value in (None, "", []):
            if required:
                errors[label] = "This field is required."
            continue

        if not isinstance(value, str):
            errors[label] = "Expected a text value."
            continue

        if len(value) > MAX_TEXT_LEN:
            errors[label] = f"Must be at most {MAX_TEXT_LEN} characters."
            continue

        if ftype == "select":
            options = spec.get("options") or []
            if value not in options:
                errors[label] = "Not a valid option."
                continue
        elif ftype == "email":
            if not _EMAIL_RE.match(value):
                errors[label] = "Enter a valid email address."
                continue
        elif ftype == "tel":
            if not _TEL_RE.match(value):
                errors[label] = "Enter a valid phone number."
                continue

        cleaned[label] = value

    if errors:
        raise CustomFieldsError(errors)
    return cleaned
