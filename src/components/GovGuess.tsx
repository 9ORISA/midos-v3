import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, GovPoll } from '../context/ApiContext';

export default function GovGuess() {
  const { polls, governorates, votePoll, loading } = useApi();
  const [selectedGovId, setSelectedGovId] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [voterCookie, setVoterCookie] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cookie = localStorage.getItem('midos_voter_cookie');
    if (!cookie) {
      cookie = `PLAYER-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem('midos_voter_cookie', cookie);
    }
    setVoterCookie(cookie);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-xs animate-pulse">
          LOADING POLLS DATA...
        </div>
      </div>
    );
  }

  const currentActivePoll = polls.find(p => {
    if (!p.end_time) return p.next_gov_id === null;
    const endTime = new Date(p.end_time).getTime();
    const now = Date.now();
    if (now < endTime) return true;
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    return now < endTime + twelveHoursMs;
  }) || null;

  const pastPolls = polls.filter(p => p.id !== currentActivePoll?.id);

  const userVote = currentActivePoll?.votes.find(
    v => v.cookie === voterCookie || (email && v.email.toLowerCase() === email.toLowerCase())
  );
  const hasVoted = !!userVote;

  const [timeRemaining, setTimeRemaining] = useState('');
  const [graceRemaining, setGraceRemaining] = useState('');
  const [now, setNow] = useState(Date.now());
  const [isTimerExpired, setIsTimerExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentActivePoll?.end_time) {
      setTimeRemaining('');
      setGraceRemaining('');
      setIsTimerExpired(false);
      return;
    }

    const endTime = new Date(currentActivePoll.end_time).getTime();
    const diff = endTime - now;

    if (diff > 0) {
      setIsTimerExpired(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
      setGraceRemaining('');
    } else {
      setIsTimerExpired(true);
      setTimeRemaining('CLOSED');
      const graceDiff = (endTime + 12 * 60 * 60 * 1000) - now;
      if (graceDiff > 0) {
        const graceH = Math.floor(graceDiff / (1000 * 60 * 60));
        const graceM = Math.floor((graceDiff % (1000 * 60 * 60)) / (1000 * 60));
        const graceS = Math.floor((graceDiff % (1000 * 60)) / 1000);
        setGraceRemaining(`${graceH.toString().padStart(2, '0')}h ${graceM.toString().padStart(2, '0')}m ${graceS.toString().padStart(2, '0')}s`);
      } else {
        setGraceRemaining('');
      }
    }
  }, [currentActivePoll, now]);

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentActivePoll || selectedGovId === null || !email.trim()) {
      alert('Please select a governorate and enter a valid email address!');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      alert('Please enter a valid email address!');
      return;
    }

    setSubmitting(true);
    const success = await votePoll(currentActivePoll.id, email.trim(), voterCookie, selectedGovId);
    if (success) {
      setSelectedGovId(null);
    }
    setSubmitting(false);
  };

  const getGovDetails = (id: number) => {
    return governorates.find(g => g.id === id);
  };

  const getVoteStats = (poll: GovPoll) => {
    const totalVotes = poll.votes.length;
    const stats = poll.goves.map(govId => {
      const govVotes = poll.votes.filter(v => v.vote === govId).length;
      const percentage = totalVotes > 0 ? Math.round((govVotes / totalVotes) * 100) : 0;
      return {
        govId,
        votes: govVotes,
        percentage
      };
    });
    return { totalVotes, stats };
  };

  return (
    <section className="max-w-4xl  mx-auto px-4 py-8 relative">
      <div className="text-center mb-8">
        <h2 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-base md:text-lg mb-2 text-glow animate-float">
          GOV GUESS 🔮
        </h2>
        <p className="font-[family-name:var(--font-family-pixelify)] text-pixel-white/60 text-xs md:text-sm max-w-lg mx-auto">
          nchallah marbouha loled
        </p>
      </div>

      <AnimatePresence mode="wait">
        {currentActivePoll ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="pixel-panel p-9 border-2 border-pixel-yellow/30 rounded mb-12 shadow-2xl relative overflow-hidden">
            <div className="md:col-span-5 flex flex-col items-center">
              {currentActivePoll.image ? (
                <div className="pixel-border p-1 bg-pixel-dark w-full overflow-hidden flex items-center justify-center">
                  <img
                    src={currentActivePoll.image}
                    alt="Travel Hint"
                    className="w-full h-full object-cover select-none"
                  />
                </div>
              ) : (
                <div className="pixel-border p-1 bg-pixel-dark w-full max-w-[240px] aspect-square flex flex-col items-center justify-center text-center">
                  <span className="text-4xl mb-2 animate-bounce">🌍</span>
                  <span className="font-[family-name:var(--font-family-pixelify)] text-pixel-yellow/40 text-[10px]">
                    NO VISUAL HINT
                  </span>
                </div>
              )}
              <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-xs mt-3 tracking-wider">
                Player ID: {voterCookie}
              </span>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-6 items-center justify-center flex flex-col ">
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h3 className="font-[family-name:var(--font-family-pixelify)] text-pixel-white text-lg md:text-3xl font-bold mt-4 leading-snug text-center">
                    {currentActivePoll.question}
                  </h3>
                </div>

                {isTimerExpired ? (
                  <div className="space-y-4 ">
                    {currentActivePoll.next_gov_id === null ? (
                      <div className="bg-pixel-red/10 border border-pixel-red/30 p-3 rounded">
                        <p className="font-[family-name:var(--font-family-pixelify)] text-pixel-red text-xs font-semibold">
                          VOTING HAS ENDED!
                        </p>
                        <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/70 text-sm mt-1">
                          Awaiting administrator to resolve the correct governorate...
                        </p>
                      </div>
                    ) : (
                      <div className="bg-pixel-yellow/10 border border-pixel-yellow/40 p-4 rounded space-y-2 glow-yellow">
                        <h4 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[8px] text-center text-glow">
                          CORRECT RESPONSE REVEALED
                        </h4>
                        <p className="font-[family-name:var(--font-family-pixelify)] text-pixel-white text-base font-bold text-center">
                          {getGovDetails(currentActivePoll.next_gov_id!)?.name} ({getGovDetails(currentActivePoll.next_gov_id!)?.name_ar})
                        </p>

                        {userVote ? (
                          userVote.vote === currentActivePoll.next_gov_id ? (
                            <div className="text-pixel-green font-[family-name:var(--font-family-pixelify)] text-xs font-semibold mt-2 text-center">
                              YOUR PREDICTION WAS CORRECT!
                            </div>
                          ) : (
                            <div className="text-pixel-red font-[family-name:var(--font-family-pixelify)] text-xs font-semibold mt-2 text-center">
                              YOUR PREDICTION WAS INCORRECT! BETTER LUCK NEXT TRIP!
                            </div>
                          )
                        ) : (
                          <div className="text-pixel-white/40 font-[family-name:var(--font-family-pixelify)] text-xs mt-2 text-center">
                            You didn't submit a prediction for this trip.
                          </div>
                        )}

                        {graceRemaining && (
                          <div className="text-pixel-white/30 font-[family-name:var(--font-family-vt)] text-[10px] text-center mt-2 pt-2 border-t border-pixel-white/5">
                            This result will be displayed for another: <span className="text-pixel-yellow font-bold">{graceRemaining}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="font-[family-name:var(--font-family-pixel)] text-pixel-white/40 text-[8px] tracking-wider">
                        FINAL COMMUNITY PREDICTIONS
                      </h4>
                      {(() => {
                        const { totalVotes, stats } = getVoteStats(currentActivePoll);
                        return (
                          <div className="space-y-2.5">
                            {stats.map(({ govId, votes: count, percentage }) => {
                              const gov = getGovDetails(govId);
                              if (!gov) return null;
                              return (
                                <div key={govId} className="space-y-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-[family-name:var(--font-family-pixelify)] text-pixel-white/80 font-medium">
                                      {gov.name} ({gov.name_ar})
                                    </span>
                                    <span className="font-[family-name:var(--font-family-vt)] text-pixel-yellow text-sm">
                                      {percentage}% ({count} {count === 1 ? 'vote' : 'votes'})
                                    </span>
                                  </div>
                                  <div className="h-3 bg-pixel-dark border border-pixel-white/10 rounded-sm overflow-hidden relative">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ duration: 0.8, ease: 'easeOut' }}
                                      className="h-full bg-gradient-to-r from-pixel-gold to-pixel-yellow shadow-[0_0_5px_rgba(255,213,74,0.3)]"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                            <div className="text-right font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-xs">
                              Total Voters: {totalVotes}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : !hasVoted ? (

                  <form onSubmit={handleVoteSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {currentActivePoll.goves.map(govId => {
                        const gov = getGovDetails(govId);
                        if (!gov) return null;
                        const isSelected = selectedGovId === govId;
                        return (
                          <button
                            key={govId}
                            type="button"
                            onClick={() => setSelectedGovId(govId)}
                            className={`pixel-panel p-3 text-center cursor-pointer transition-all flex flex-col justify-center items-center ${isSelected
                              ? 'border-pixel-yellow border-2 bg-pixel-yellow/10 scale-[1.03] glow-yellow'
                              : 'border-pixel-white/10 hover:border-pixel-yellow/50 hover:bg-pixel-white/5'
                              }`}
                          >
                            <span className="font-[family-name:var(--font-family-pixelify)] text-pixel-white text-sm font-semibold">
                              {gov.name}
                            </span>
                            <span className="font-[family-name:var(--font-family-pixelify)] text-pixel-yellow text-xs mt-1">
                              {gov.name_ar}
                            </span>
                            <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-[11px] capitalize mt-1">
                              {gov.region} region
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <label className="block font-[family-name:var(--font-family-vt)] text-pixel-white/50 text-sm">
                        Enter Email to cast your prediction:
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="admin-input rounded text-sm tracking-wide"
                        disabled={submitting}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || selectedGovId === null}
                      className={`retro-btn w-full font-bold ${selectedGovId === null ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      {submitting ? 'CASTING GUESS...' : "GUESS " + getGovDetails(currentActivePoll.next_gov_id!)?.name + " (" + getGovDetails(currentActivePoll.next_gov_id!)?.name_ar + ") ⚔️"}
                    </button>
                  </form>
                ) : (

                  <div className="space-y-4">
                    <div className="bg-pixel-green/10 border border-pixel-green/30 p-3 rounded ">
                      <p className="font-[family-name:var(--font-family-pixelify)] text-pixel-green text-[20px] font-semibold text-center">
                        You guessed: <span className="text-pixel-yellow font-bold">{getGovDetails(userVote.vote)?.name} ({getGovDetails(userVote.vote)?.name_ar})</span>
                      </p>
                      <p className="font-[family-name:var(--font-family-vt)] text-pixel-white/70 text-sm text-center">
                        {!isTimerExpired && timeRemaining && (
                          <div className="flex items-center justify-center gap-2 text-pixel-yellow mt-2">
                            <span className="font-[family-name:var(--font-family-vt)] text-xs tracking-wider">
                              VOTING ENDS IN: <span className="font-bold text-glow text-pixel-green text-[18px]">{timeRemaining}</span>
                            </span>
                          </div>
                        )}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-[family-name:var(--font-family-pixel)] text-pixel-white/40 text-[8px] tracking-wider">
                        COMMUNITY PREDICTIONS
                      </h4>
                      {(() => {
                        const { totalVotes, stats } = getVoteStats(currentActivePoll);
                        return (
                          <div className="space-y-2.5">
                            {stats.map(({ govId, votes: count, percentage }) => {
                              const gov = getGovDetails(govId);
                              if (!gov) return null;
                              return (
                                <div key={govId} className="space-y-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-[family-name:var(--font-family-pixelify)] text-pixel-white/80 font-medium">
                                      {gov.name} ({gov.name_ar})
                                    </span>
                                    <span className="font-[family-name:var(--font-family-vt)] text-pixel-yellow text-sm">
                                      {percentage}% ({count} {count === 1 ? 'vote' : 'votes'})
                                    </span>
                                  </div>
                                  <div className="h-3 bg-pixel-dark border border-pixel-white/10 rounded-sm overflow-hidden relative">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ duration: 0.8, ease: 'easeOut' }}
                                      className="h-full bg-gradient-to-r from-pixel-gold to-pixel-yellow shadow-[0_0_5px_rgba(255,213,74,0.3)]"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                            <div className="text-right font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-xs">
                              Total Voters: {totalVotes}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="pixel-panel p-8 text-center border-2 border-pixel-white/10 rounded mb-12">
            <span className="text-4xl block mb-2">😴</span>
            <h3 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[10px] mb-2 text-glow">
              NO ACTIVE TRAVEL GUESS
            </h3>
            <p className="font-[family-name:var(--font-family-pixelify)] text-pixel-white/40 text-xs">
              Midos isn't planning a new trip right now. Check back later when an admin launches a new governorate poll!
            </p>
          </div>
        )}
      </AnimatePresence>

      <div>
        <h3 className="font-[family-name:var(--font-family-pixel)] text-pixel-yellow text-[10px] mb-4 tracking-wider">
          PAST TRAVEL RESULTS 📜
        </h3>
        {pastPolls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastPolls.map(poll => {
              const { totalVotes, stats } = getVoteStats(poll);
              const isResolved = poll.next_gov_id !== null;
              const correctGov = isResolved ? getGovDetails(poll.next_gov_id!) : null;

              const voterLog = poll.votes.find(v => v.cookie === voterCookie);
              const votedCorrect = voterLog && poll.next_gov_id && voterLog.vote === poll.next_gov_id;

              return (
                <div key={poll.id} className="pixel-panel p-4 border border-pixel-white/10 rounded space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-[family-name:var(--font-family-pixelify)] text-pixel-white text-sm font-bold line-clamp-2">
                      {poll.question}
                    </h4>
                    <span className="font-[family-name:var(--font-family-vt)] text-pixel-white/30 text-xs whitespace-nowrap">
                      {new Date(poll.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {poll.image && (
                    <div className="h-28 w-full border border-pixel-white/5 rounded overflow-hidden">
                      <img src={poll.image} alt="" className="w-full h-full object-cover opacity-60" />
                    </div>
                  )}

                  <div className="space-y-1 bg-pixel-dark/30 p-2 border border-pixel-white/5 rounded text-xs font-[family-name:var(--font-family-pixelify)]">
                    <div className="flex justify-between">
                      <span className="text-pixel-white/40">Total Guesses:</span>
                      <span className="text-pixel-white">{totalVotes} players</span>
                    </div>
                    {isResolved ? (
                      <div className="flex justify-between">
                        <span className="text-pixel-white/40">Correct Answer:</span>
                        <span className="text-pixel-green font-bold">
                          {correctGov?.name} ({correctGov?.name_ar})
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-pixel-white/40">Status:</span>
                        <span className="text-pixel-yellow font-bold">Awaiting Trip Closure</span>
                      </div>
                    )}
                  </div>

                  {voterLog && (
                    <div className="flex items-center justify-between text-xs font-[family-name:var(--font-family-pixelify)] border-t border-pixel-white/5 pt-2">
                      <div className="text-pixel-white/50">
                        Your Guess: <span className="text-pixel-yellow font-semibold">{getGovDetails(voterLog.vote)?.name}</span>
                      </div>
                      {isResolved && (
                        votedCorrect ? (
                          <span className="text-pixel-green bg-pixel-green/10 border border-pixel-green/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            👑 CORRECT (+50 DT)
                          </span>
                        ) : (
                          <span className="text-pixel-red bg-pixel-red/10 border border-pixel-red/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            ⚔️ INCORRECT
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-pixel-white/30 font-[family-name:var(--font-family-pixelify)] text-xs">
            No history available yet.
          </div>
        )}
      </div>
    </section>
  );
}
