import BarCodeScanner from "@/components/BarCodeScanner";
import PreviousBarCode from "@/components/PreviousBarCode";

export default function HomePage() {
  return (
    <main>
      {/* <PreviousBarCode /> */}
      <BarCodeScanner />
    </main>
  );
}
