import { useState } from "react";
import { Alert, Button } from "flowbite-react";
import { useTranslation } from "react-i18next";
import { DonutSwatch } from "./components/DonutSwatch";
import { generatePalette, SPLIT_COMPLEMENTARY } from "./colour/harmony";
import { usePaletteNames } from "./colour/usePaletteNames";
import type { Colour } from "./colour/types";

function App() {
  const { t } = useTranslation();
  const [palette, setPalette] = useState<Colour[]>(
    () => generatePalette(SPLIT_COMPLEMENTARY)
  );
  const namesQuery = usePaletteNames(palette.map((colour) => colour.hex));
  const handleGenerate = () => { 
    setPalette(generatePalette(SPLIT_COMPLEMENTARY));
  }

  return (
    <div className='min-h-screen bg-slate-100 dark:bg-slate-900 p-8'>
        {namesQuery.isError && (
          <Alert color="failure" className="my-4">
                <div className="flex items-center gap-3">
            <span className="font-medium">{t("app.error.namesFailed")}</span><Button onClick={() => namesQuery.refetch()}>{t("app.error.retry")}</Button>
               </div>
          </Alert>
        )}

      <section className="mb-4">
        <DonutSwatch palette={palette} />
      </section>
         
      <Button onClick={handleGenerate}>{t("app.generate")}</Button>
   
    </div>
  );
}

export default App;