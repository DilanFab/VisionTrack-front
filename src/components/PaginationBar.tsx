import { Pagination } from "react-bootstrap";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function PaginationBar({ page, totalPages, total, limit, onPageChange }: Props) {
  if (totalPages <= 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const items: number[] = [];
  const range = 2;
  const start = Math.max(1, page - range);
  const end = Math.min(totalPages, page + range);

  for (let i = start; i <= end; i++) items.push(i);

  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <small className="text-muted">
        Mostrando {from} a {to} de {total} registros
      </small>
      <Pagination className="mb-0" size="sm">
        <Pagination.First onClick={() => onPageChange(1)} disabled={page === 1} />
        <Pagination.Prev onClick={() => onPageChange(page - 1)} disabled={page === 1} />
        {start > 1 && <Pagination.Ellipsis disabled />}
        {items.map((i) => (
          <Pagination.Item key={i} active={i === page} onClick={() => onPageChange(i)}>
            {i}
          </Pagination.Item>
        ))}
        {end < totalPages && <Pagination.Ellipsis disabled />}
        <Pagination.Next onClick={() => onPageChange(page + 1)} disabled={page === totalPages} />
        <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={page === totalPages} />
      </Pagination>
    </div>
  );
}
