import { getCompletionBurstModel, type CompletionBurstVariant } from "@/lib/immersive/visual-state";

type CompletionBurstProps = {
  visible: boolean;
  variant: CompletionBurstVariant;
};

export function CompletionBurst({ visible, variant }: CompletionBurstProps) {
  const model = getCompletionBurstModel(visible, variant);

  return (
    <div className={model.className} aria-hidden={!visible}>
      <span className="completion-burst__ring" />
      <div>
        <strong>{model.title}</strong>
        <small>{model.subtitle}</small>
      </div>
    </div>
  );
}
