import { AppRouter } from '@/routes/router';
import { useTheme } from '@/common/hooks/useTheme';

function App() {
  useTheme(); // Apply theme + listen for OS preference changes at root level
  return <AppRouter />;
}

export default App;
