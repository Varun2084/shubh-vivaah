"""Resume text extraction from uploaded files (PDF / DOCX / TXT).

PDF and DOCX parsing use optional dependencies (pypdf, python-docx). If a
dependency is missing, a clear error is raised so the caller can surface a
helpful message instead of failing opaquely.
"""
from __future__ import annotations

import io

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB


class ExtractionError(Exception):
    """Raised when a resume file cannot be turned into text."""


def extract_text(filename: str, data: bytes) -> str:
    if len(data) > MAX_BYTES:
        raise ExtractionError("File is too large (max 5 MB).")

    ext = _extension(filename)
    if ext not in SUPPORTED_EXTENSIONS:
        raise ExtractionError(
            f"Unsupported file type '{ext or 'unknown'}'. "
            "Upload a PDF, DOCX, TXT, or MD file."
        )

    if ext in {".txt", ".md"}:
        text = _decode_text(data)
    elif ext == ".pdf":
        text = _extract_pdf(data)
    else:  # .docx
        text = _extract_docx(data)

    text = text.strip()
    if len(text) < 20:
        raise ExtractionError(
            "Could not read enough text from the file. "
            "If it is a scanned/image PDF, paste the text manually."
        )
    return text


def _extension(filename: str) -> str:
    name = (filename or "").lower()
    dot = name.rfind(".")
    return name[dot:] if dot != -1 else ""


def _decode_text(data: bytes) -> str:
    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="ignore")


def _extract_pdf(data: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:  # pragma: no cover - dependency guard
        raise ExtractionError(
            "PDF support requires the 'pypdf' package on the server."
        ) from exc
    try:
        reader = PdfReader(io.BytesIO(data))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception as exc:
        raise ExtractionError("Failed to parse the PDF file.") from exc


def _extract_docx(data: bytes) -> str:
    try:
        import docx
    except ImportError as exc:  # pragma: no cover - dependency guard
        raise ExtractionError(
            "DOCX support requires the 'python-docx' package on the server."
        ) from exc
    try:
        document = docx.Document(io.BytesIO(data))
        return "\n".join(p.text for p in document.paragraphs)
    except Exception as exc:
        raise ExtractionError("Failed to parse the DOCX file.") from exc
