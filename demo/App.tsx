import { useState } from 'react';
import {
  Hand,
  Deck,
  CardStack,
  DropZone,
  Card,
  CardDndProvider,
  DraggableCard,
  DroppableZone,
} from '../src';
import type { HandLayout, CardData, DragPreviewMode } from '../src';

function App() {
  // Phase 2 state
  const [handLayout, setHandLayout] = useState<HandLayout>('fan');
  const [deckCount, setDeckCount] = useState(52);

  // Phase 3 state - Drag & Drop
  const [previewMode, setPreviewMode] = useState<DragPreviewMode>('original');
  const [hapticEnabled, setHapticEnabled] = useState(false);
  const [zone1Cards, setZone1Cards] = useState<CardData[]>([
    { suit: 'hearts', rank: 'A' },
    { suit: 'diamonds', rank: 'K' },
    { suit: 'clubs', rank: 'Q' },
  ]);
  const [zone2Cards, setZone2Cards] = useState<CardData[]>([
    { suit: 'spades', rank: 'J' },
    { suit: 'hearts', rank: '10' },
  ]);
  const [zone3Cards, setZone3Cards] = useState<CardData[]>([]);

  // Sample cards for Phase 2 demonstrations
  const handCards: CardData[] = [
    { suit: 'hearts', rank: 'A' },
    { suit: 'diamonds', rank: 'K' },
    { suit: 'clubs', rank: 'Q' },
    { suit: 'spades', rank: 'J' },
    { suit: 'hearts', rank: '10' },
  ];

  // Discard pile example
  const discardPile: CardData[] = [
    { suit: 'hearts', rank: '9' },
    { suit: 'diamonds', rank: '8' },
    { suit: 'clubs', rank: '7' },
    { suit: 'spades', rank: '6' },
  ];

  const handleDraw = () => {
    setDeckCount(prev => Math.max(0, prev - 1));
  };

  // Drag & Drop handlers
  const handleDragEnd = (card: CardData, targetZoneId: string | null, sourceZoneId?: string) => {
    console.log('Drag end:', { card, targetZoneId, sourceZoneId });

    if (!targetZoneId || !sourceZoneId) return;

    // Remove from source
    const removeFromZone = (zoneId: string, setter: React.Dispatch<React.SetStateAction<CardData[]>>) => {
      setter(prev => prev.filter(c => !(c.suit === card.suit && c.rank === card.rank)));
    };

    // Add to target
    const addToZone = (zoneId: string, setter: React.Dispatch<React.SetStateAction<CardData[]>>) => {
      setter(prev => [...prev, card]);
    };

    // Remove from source zone
    if (sourceZoneId === 'zone-1') removeFromZone(sourceZoneId, setZone1Cards);
    if (sourceZoneId === 'zone-2') removeFromZone(sourceZoneId, setZone2Cards);
    if (sourceZoneId === 'zone-3') removeFromZone(sourceZoneId, setZone3Cards);

    // Add to target zone
    if (targetZoneId === 'zone-1') addToZone(targetZoneId, setZone1Cards);
    if (targetZoneId === 'zone-2') addToZone(targetZoneId, setZone2Cards);
    if (targetZoneId === 'zone-3') addToZone(targetZoneId, setZone3Cards);
  };

  // Generate 52 cards for performance test
  const all52Cards: CardData[] = ['hearts', 'diamonds', 'clubs', 'spades'].flatMap(suit =>
    ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'].map(rank => ({
      suit: suit as CardData['suit'],
      rank: rank as CardData['rank'],
    }))
  );

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Card Components Demo
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#64748b',
          margin: 0
        }}>
          Phase 1-3: Cards, Containers & Drag-and-Drop
        </p>
      </header>

      {/* PHASE 3: DRAG & DROP SECTION */}
      <section style={{
        marginBottom: '60px',
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        borderRadius: '16px',
        padding: '32px',
        border: '2px solid #667eea40'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '8px',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              NEW
            </span>
            Phase 3: Drag & Drop System
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748b',
            marginBottom: '20px'
          }}>
            Full dnd-kit integration with touch support, haptic feedback, and multi-card selection
          </p>

          {/* Controls Panel */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#475569',
                marginBottom: '8px'
              }}>
                Preview Mode
              </label>
              <select
                value={previewMode}
                onChange={(e) => setPreviewMode(e.target.value as DragPreviewMode)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="original">Original (100%)</option>
                <option value="translucent">Translucent (70%)</option>
                <option value="miniature">Miniature (75%)</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#475569',
                padding: '8px 0'
              }}>
                <input
                  type="checkbox"
                  checked={hapticEnabled}
                  onChange={(e) => setHapticEnabled(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                <span>Haptic Feedback (mobile)</span>
              </label>
              <p style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                margin: '4px 0 0 26px'
              }}>
                Vibration on pickup/drop
              </p>
            </div>

            <div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#475569',
                marginBottom: '8px'
              }}>
                Current Mode
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <span style={{
                  padding: '6px 12px',
                  background: '#f1f5f9',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#475569'
                }}>
                  {previewMode}
                </span>
                <span style={{
                  padding: '6px 12px',
                  background: hapticEnabled ? '#dcfce7' : '#f1f5f9',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: hapticEnabled ? '#166534' : '#475569'
                }}>
                  {hapticEnabled ? '📳 Haptic ON' : 'Haptic OFF'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Zone Drag & Drop Demo */}
        <CardDndProvider
          onDragEnd={handleDragEnd}
          onDragStart={(card, sourceZoneId) => console.log('Drag start:', card, sourceZoneId)}
          previewMode={previewMode}
          hapticFeedback={hapticEnabled}
        >
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#1e293b'
            }}>
              Interactive Multi-Zone Drag & Drop
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '20px'
            }}>
              Drag cards between zones. Try different preview modes and haptic feedback settings above.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {/* Zone 1 */}
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: '12px'
                }}>
                  Zone 1: Player Hand
                </div>
                <DroppableZone
                  id="zone-1"
                  label="Player Zone"
                  emptyState="placeholder"
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    minHeight: '120px'
                  }}>
                    {zone1Cards.map((card, idx) => (
                      <DraggableCard
                        key={`${card.suit}-${card.rank}-${idx}`}
                        id={`zone1-${card.suit}-${card.rank}-${idx}`}
                        card={card}
                        sourceZoneId="zone-1"
                        isFaceUp={true}
                        style={{ width: '80px' }}
                      />
                    ))}
                  </div>
                </DroppableZone>
              </div>

              {/* Zone 2 */}
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: '12px'
                }}>
                  Zone 2: Opponent Hand
                </div>
                <DroppableZone
                  id="zone-2"
                  label="Opponent Zone"
                  emptyState="placeholder"
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    minHeight: '120px'
                  }}>
                    {zone2Cards.map((card, idx) => (
                      <DraggableCard
                        key={`${card.suit}-${card.rank}-${idx}`}
                        id={`zone2-${card.suit}-${card.rank}-${idx}`}
                        card={card}
                        sourceZoneId="zone-2"
                        isFaceUp={true}
                        style={{ width: '80px' }}
                      />
                    ))}
                  </div>
                </DroppableZone>
              </div>

              {/* Zone 3 */}
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: '12px'
                }}>
                  Zone 3: Discard Pile
                </div>
                <DroppableZone
                  id="zone-3"
                  label="Discard Here"
                  emptyState="placeholder"
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    minHeight: '120px'
                  }}>
                    {zone3Cards.map((card, idx) => (
                      <DraggableCard
                        key={`${card.suit}-${card.rank}-${idx}`}
                        id={`zone3-${card.suit}-${card.rank}-${idx}`}
                        card={card}
                        sourceZoneId="zone-3"
                        isFaceUp={true}
                        style={{ width: '80px' }}
                      />
                    ))}
                  </div>
                </DroppableZone>
              </div>
            </div>
          </div>

          {/* Performance Test: 52 Draggable Cards */}
          <div style={{ marginTop: '40px' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#1e293b'
            }}>
              Performance Test: Full Deck (52 Cards)
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '16px'
            }}>
              All 52 cards are draggable with React.memo optimization. No visible jank expected.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
              gap: '8px',
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {all52Cards.map((card, idx) => (
                <DraggableCard
                  key={`perf-${card.suit}-${card.rank}`}
                  id={`perf-${card.suit}-${card.rank}-${idx}`}
                  card={card}
                  sourceZoneId="performance-test"
                  isFaceUp={true}
                  style={{ width: '70px', height: '98px' }}
                />
              ))}
            </div>
          </div>
        </CardDndProvider>
      </section>

      {/* PHASE 2 & 1 SECTIONS (keeping existing demos) */}

      {/* Individual Card Demo */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '16px',
          color: '#1e293b'
        }}>
          Individual Card (Phase 1)
        </h2>
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Card
            card={{ suit: 'hearts', rank: 'A' }}
            isFaceUp={true}
            style={{ width: '120px' }}
          />
          <Card
            card={{ suit: 'spades', rank: 'K' }}
            isFaceUp={true}
            style={{ width: '120px' }}
          />
          <Card
            card={{ suit: 'diamonds', rank: 'Q' }}
            isFaceUp={false}
            style={{ width: '120px' }}
          />
        </div>
      </section>

      {/* Hand Component */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            margin: 0,
            color: '#1e293b'
          }}>
            Hand Component (Phase 2)
          </h2>
          <div style={{
            display: 'flex',
            gap: '8px',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '8px'
          }}>
            {(['fan', 'spread', 'stack'] as HandLayout[]).map(layout => (
              <button
                key={layout}
                onClick={() => setHandLayout(layout)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: handLayout === layout ? '#3b82f6' : 'transparent',
                  color: handLayout === layout ? 'white' : '#64748b',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize'
                }}
              >
                {layout}
              </button>
            ))}
          </div>
        </div>
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '40px',
          minHeight: '300px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ width: '700px' }}>
            <Hand
              cards={handCards}
              layout={handLayout}
              hoverEffect="lift"
            />
          </div>
        </div>
      </section>

      {/* Deck Component */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '16px',
          color: '#1e293b'
        }}>
          Deck Component (Phase 2)
        </h2>
        <div style={{
          display: 'flex',
          gap: '40px',
          alignItems: 'center',
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '40px'
        }}>
          <Deck
            count={deckCount}
            onDraw={handleDraw}
            emptyState="placeholder"
          />
          <div>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '8px'
            }}>
              Cards remaining: <strong style={{ color: '#1e293b' }}>{deckCount}</strong>
            </p>
            <button
              onClick={handleDraw}
              disabled={deckCount === 0}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                background: deckCount > 0 ? '#3b82f6' : '#cbd5e1',
                color: 'white',
                fontWeight: 500,
                cursor: deckCount > 0 ? 'pointer' : 'not-allowed',
                fontSize: '0.875rem',
                marginRight: '8px'
              }}
            >
              Draw Card
            </button>
            <button
              onClick={() => setDeckCount(52)}
              style={{
                padding: '10px 20px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                background: 'white',
                color: '#475569',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Reset Deck
            </button>
          </div>
        </div>
      </section>

      {/* CardStack Component */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '16px',
          color: '#1e293b'
        }}>
          CardStack Component (Phase 2)
        </h2>
        <p style={{
          fontSize: '0.875rem',
          color: '#64748b',
          marginBottom: '20px',
          maxWidth: '700px'
        }}>
          Overlapping card display with configurable cascade. Perfect for discard piles, played cards, and stacking areas.
        </p>
        <div style={{
          display: 'flex',
          gap: '40px',
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '40px',
          alignItems: 'flex-start'
        }}>
          <div>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '8px',
              fontWeight: 500
            }}>
              All face-up
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              marginBottom: '16px'
            }}>
              Show all cards
            </p>
            <CardStack
              cards={discardPile}
              faceUp={true}
              maxRotation={5}
            />
          </div>
          <div>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '8px',
              fontWeight: 500
            }}>
              Top only (default)
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              marginBottom: '16px'
            }}>
              Discard pile style
            </p>
            <CardStack
              cards={discardPile}
              faceUp="top-only"
              maxRotation={5}
            />
          </div>
          <div>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '8px',
              fontWeight: 500
            }}>
              All face-down
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              marginBottom: '16px'
            }}>
              Hidden stack
            </p>
            <CardStack
              cards={discardPile}
              faceUp={false}
              maxRotation={5}
            />
          </div>
        </div>
      </section>

      {/* DropZone Component */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '16px',
          color: '#1e293b'
        }}>
          DropZone Component (Phase 2)
        </h2>
        <div style={{
          display: 'flex',
          gap: '20px',
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '40px'
        }}>
          <div>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '16px'
            }}>
              Empty (idle)
            </p>
            <DropZone
              label="Drop cards here"
              state="idle"
            />
          </div>
          <div>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '16px'
            }}>
              Active
            </p>
            <DropZone
              label="Active zone"
              state="active"
            />
          </div>
          <div>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '16px'
            }}>
              With card
            </p>
            <DropZone state="idle">
              <Card
                card={{ suit: 'clubs', rank: '5' }}
                isFaceUp={true}
                style={{ width: '120px' }}
              />
            </DropZone>
          </div>
        </div>
      </section>

      {/* All Cards Grid */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '16px',
          color: '#1e293b'
        }}>
          Full Deck (52 Cards) - Phase 1
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '12px',
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '40px'
        }}>
          {(['hearts', 'diamonds', 'clubs', 'spades'] as const).map(suit =>
            (['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'] as const).map(rank => (
              <Card
                key={`${suit}-${rank}`}
                card={{ suit, rank }}
                isFaceUp={true}
                style={{ width: 80, height: 112 }}
              />
            ))
          )}
        </div>
      </section>

      <footer style={{
        marginTop: '80px',
        paddingTop: '20px',
        borderTop: '1px solid #e2e8f0',
        color: '#64748b',
        fontSize: '0.875rem',
        textAlign: 'center'
      }}>
        <p>
          ✓ Phase 1: Card components with flip animations<br />
          ✓ Phase 2: Container components & layouts<br />
          ✓ Phase 3: Drag & drop with touch support & haptic feedback<br />
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
            → Phase 4-6: State management, Accessibility, Developer Experience (coming next)
          </span>
        </p>
      </footer>
    </div>
  );
}

export default App;
