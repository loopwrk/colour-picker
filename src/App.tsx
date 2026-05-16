import { Button } from 'flowbite-react';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
      <Button>{t('app.smoke')}</Button>
    </div>
  );
}

export default App;