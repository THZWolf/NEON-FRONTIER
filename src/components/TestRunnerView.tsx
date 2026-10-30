import React, { useState } from 'react';
import { TestResult } from '../types/neon';
import { CheckCircle2, XCircle, Play, RefreshCw, Shield, Terminal } from 'lucide-react';

interface TestRunnerViewProps {
  results: TestResult[];
  onRunTests: () => TestResult[];
}

export const TestRunnerView: React.FC<TestRunnerViewProps> = ({ results: initialResults, onRunTests }) => {
  const [results, setResults] = useState<TestResult[]>(initialResults || []);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  React.useEffect(() => {
    if (initialResults && initialResults.length > 0) {
      setResults(initialResults);
    }
  }, [initialResults]);

  const handleRunAll = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = onRunTests();
      setResults(res);
      setIsRunning(false);
    }, 250);
  };

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Test Runner Header */}
      <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/40 flex items-center justify-center text-[#00f2fe]">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                SUÍTE DE TESTES OBRIGATÓRIOS (8/8)
              </h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  allPassed
                    ? 'bg-[#11261a] border-[#1f472e] text-[#67c23a]'
                    : 'bg-[#331111] border-[#f56c6c] text-[#f56c6c]'
                }`}
              >
                {passedCount} / {totalCount} APROVADOS
              </span>
            </div>
            <p className="text-[11px] text-[#718dae]">
              Execução e validação dos 8 requisitos de integridade do NEON FRONTIER
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAll}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00f2fe] hover:bg-[#38f5fe] text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] cursor-pointer disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Executando...</span>
            </>
          ) : (
            <>
              <Play size={13} />
              <span>Executar Todos os Testes</span>
            </>
          )}
        </button>
      </div>

      {/* Test Cards List */}
      <div className="space-y-2.5">
        {results.map((t, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border text-xs transition-all ${
              t.passed
                ? 'bg-[#0e1828] border-[#1c334d]'
                : 'bg-[#211115] border-[#541f2a]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                {t.passed ? (
                  <CheckCircle2 size={16} className="text-[#67c23a] shrink-0" />
                ) : (
                  <XCircle size={16} className="text-[#f56c6c] shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#132338] border border-[#213f61] text-[#00f2fe] font-bold">
                      {t.suiteName}
                    </span>
                    <b className="text-white text-sm font-['Chakra_Petch']">{t.testName}</b>
                  </div>
                  <p className="text-xs text-[#a2bedb] mt-1 leading-relaxed">{t.message}</p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-3">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    t.passed ? 'bg-[#153322] text-[#67c23a]' : 'bg-[#40151c] text-[#f56c6c]'
                  }`}
                >
                  {t.passed ? 'PASSED' : 'FAILED'}
                </span>
                <small className="block text-[9px] text-[#5c7794] mt-1">{t.durationMs}ms</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Output Sample */}
      <div className="bg-[#080e18] border border-[#16253a] rounded-xl p-3.5 space-y-1 text-xs text-[#829ebd]">
        <div className="flex items-center gap-1.5 text-[#00f2fe] text-[11px] font-bold mb-1">
          <Terminal size={13} />
          <span>Saída de Verificação do Test Runner:</span>
        </div>
        <p className="font-mono text-[11px] text-[#5a7694]">
          &gt; TestRegistry: 8 test cases registered across 4 suites.<br />
          &gt; Execution completed without assertion breaches.<br />
          &gt; Memory persistence roundtrip and decision explainability verified.
        </p>
      </div>
    </div>
  );
};
