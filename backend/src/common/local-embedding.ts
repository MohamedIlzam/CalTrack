let miniLmPipelinePromise: Promise<any> | null = null;

/**
 * Process-wide lazy singleton for the MiniLM feature-extraction pipeline.
 * Food search and nutrition RAG share one model allocation on free-tier hosts.
 */
export function getSharedMiniLmPipeline(): Promise<any> {
  if (!miniLmPipelinePromise) {
    miniLmPipelinePromise = import('@xenova/transformers')
      .then(({ pipeline }) => pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'))
      .catch((error) => {
        miniLmPipelinePromise = null;
        throw error;
      });
  }
  return miniLmPipelinePromise;
}
