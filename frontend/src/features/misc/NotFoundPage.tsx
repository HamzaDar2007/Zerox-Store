import { Link } from 'react-router-dom';
import { Button } from '@/common/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
