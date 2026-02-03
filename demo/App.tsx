import { useState } from 'react';
import { Hand, Deck, CardStack, DropZone, Card } from '../src';
import type { HandLayout, CardData } from '../src';

function App() {
  const [handLayout, setHandLayout] = useState<HandLayout>('fan');
  const [deckCount, setDeckCount] = useState(52);

  // Sample cards for demonstrations
  const handCards: CardData[] = [
    { suit: 'hearts', rank: 'A' },
    { suit: 'diamonds', rank: 'K' },
    { suit: 'clubs', rank: 'Q' },
    { suit: 'spades', rank: 'J' },
    { suit: 'hearts', rank: '10' },
  ];

  // Discard pile example - realistic descending sequence
  const discardPile: CardData[] = [
    { suit: 'hearts', rank: '9' },
    { suit: 'diamonds', rank: '8' },
    { suit: 'clubs', rank: '7' },
    { suit: 'spades', rank: '6' },
  ];

  const handleDraw = () => {
    setDeckCount(prev => Math.max(0, prev - 1));
  };

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
          Phase 2: Container Components & Layouts
        </p>
      </header>

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
            Hand Component
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
          Deck Component
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
          CardStack Component
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
          DropZone Component
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
          → Phase 3: Drag & drop (coming next)
        </p>
      </footer>
    </div>
  );
}

export default App;
