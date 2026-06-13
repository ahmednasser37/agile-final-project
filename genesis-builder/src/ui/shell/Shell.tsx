import React from 'react';
import { useStore } from '../../app/store';
import { writeXER } from '../../io/xer/writer';

export const Shell: React.FC = () => {
    const { project, updateProject } = useStore();
    const currentStage = project.ui.stageReached;

    const nav = ['S0: Setup', 'S1: Calendars', 'S2: BOQ', 'S3: WBS', 'S4: Activities', 'S5: Gantt', 'S6: Export'];

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--void-900)' }}>
            <div style={{ width: '200px', borderRight: '1px solid var(--void-700)', padding: 'var(--space-4)' }}>
                {nav.map((n, i) => (
                    <div key={i}
                         style={{
                             padding: 'var(--space-2)',
                             color: i === currentStage ? 'var(--amber-400)' : 'var(--ink-300)',
                             cursor: 'pointer',
                             fontFamily: 'var(--font-mono)'
                         }}
                         onClick={() => updateProject(p => { p.ui.stageReached = i; })}
                    >
                        {n}
                    </div>
                ))}
            </div>
            <div style={{ flex: 1, padding: 'var(--space-6)', color: 'var(--ink-100)', overflow: 'auto' }}>
                <h1 style={{ fontFamily: 'var(--font-mono)' }}>{nav[currentStage]}</h1>

                {currentStage === 0 && (
                    <div>
                        <h2>Project Meta</h2>
                        <input value={project.meta.name} onChange={e => updateProject(p => { p.meta.name = e.target.value; })} style={{ background: 'var(--void-800)', color: 'white', padding: '8px', border: '1px solid var(--void-700)' }} />
                    </div>
                )}

                {currentStage === 5 && (
                    <div style={{ height: '400px', border: '1px solid var(--void-700)' }}>
                        <svg width="100%" height="100%">
                            {project.activities.map((a, i) => (
                                <rect key={a.id}
                                    x={(a.es / (24*60)) * 10}
                                    y={i * 30 + 10}
                                    width={Math.max(3, ((a.ef - a.es) / (24*60)) * 10)}
                                    height="14"
                                    fill={a.critical ? "var(--red-500)" : "var(--amber-600)"}
                                    rx="2"
                                />
                            ))}
                        </svg>
                    </div>
                )}

                {currentStage === 6 && (
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={() => {
                            const blob = new Blob([JSON.stringify(project, null, 2)], {type: 'application/json'});
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${project.meta.name}_GENESIS.json`;
                            a.click();
                        }} style={{ background: 'var(--amber-600)', color: 'black', padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                            Download .genesis.json
                        </button>

                        <button onClick={() => {
                            const xerData = writeXER(project);
                            const blob = new Blob([xerData], {type: 'text/plain;charset=windows-1252'});
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${project.meta.name}_GENESIS.xer`;
                            a.click();
                        }} style={{ background: 'var(--blue-500)', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                            Download .XER
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
