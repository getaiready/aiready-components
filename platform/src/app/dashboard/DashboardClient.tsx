'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PlatformShell from '@/components/PlatformShell';
import { RocketIcon } from '@/components/Icons';
import type { Repository, Analysis, Team, TeamMember } from '@/lib/db';
import { TrendsView } from './TrendsView';
import { RepoCard } from './components/RepoCard';
import { TeamManagement } from './components/TeamManagement';
import { AddRepoModal } from './components/AddRepoModal';
import { WelcomeHeader } from './components/WelcomeHeader';
import { LimitsBanner } from './components/LimitsBanner';
import { CliQuickstart } from './components/CliQuickstart';
import { BadgeModal } from './components/BadgeModal';
import { useDashboardData } from './hooks/useDashboardData';

type RepoWithAnalysis = Repository & { latestAnalysis: Analysis | null };

interface Props {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    githubId?: string | null;
    googleId?: string | null;
  };
  repos: RepoWithAnalysis[];
  teams: (TeamMember & { team: Team })[];
  overallScore: number | null;
}

export default function DashboardClient({
  user,
  repos: initialRepos,
  teams,
  overallScore,
}: Props) {
  const [currentTeamId, setCurrentTeamId] = useState<string | 'personal'>(
    'personal'
  );

  const {
    repos,
    setRepos,
    pendingScanRepoIds,
    uploadingRepoId,
    scanningRepoId,
    uploadError,
    setUploadError,
    handleScanRepo,
    handleUploadAnalysis,
    handleDeleteRepo,
  } = useDashboardData(initialRepos, currentTeamId);

  const [showAddRepo, setShowAddRepo] = useState(false);
  const [addRepoForm, setAddRepoForm] = useState({
    name: '',
    url: '',
    description: '',
    defaultBranch: 'main',
  });
  const [addRepoError, setAddRepoError] = useState<string | null>(null);
  const [addRepoLoading, setAddRepoLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [repoForTrends, setRepoForTrends] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [repoForBadge, setRepoForBadge] = useState<{
    id: string;
    name: string;
  } | null>(null);

  async function handleCheckout(plan: 'pro' | 'team') {
    try {
      setBillingLoading(true);
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          teamId: currentTeamId,
          plan,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setUploadError(data.error || 'Failed to start checkout');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setUploadError('Checkout failed. Please try again.');
    } finally {
      setBillingLoading(false);
    }
  }

  async function handlePortal(customerId: string) {
    try {
      setBillingLoading(true);
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'portal',
          customerId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setUploadError(data.error || 'Failed to open portal');
      }
    } catch (err) {
      console.error('Portal error:', err);
      setUploadError('Failed to open billing portal.');
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleAddRepo(e: React.FormEvent) {
    e.preventDefault();
    setAddRepoError(null);
    setAddRepoLoading(true);

    try {
      const res = await fetch('/api/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addRepoForm,
          teamId: currentTeamId === 'personal' ? undefined : currentTeamId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddRepoError(data.error || 'Failed to add repository');
        return;
      }

      const newRepo: RepoWithAnalysis = { ...data.repo, latestAnalysis: null };
      setRepos((prev) => [newRepo, ...prev]);
      setShowAddRepo(false);
      setAddRepoForm({
        name: '',
        url: '',
        description: '',
        defaultBranch: 'main',
      });
    } catch {
      setAddRepoError('Network error. Please try again.');
    } finally {
      setAddRepoLoading(false);
    }
  }

  return (
    <PlatformShell
      user={user}
      teams={teams}
      overallScore={overallScore}
      activePage="dashboard"
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <WelcomeHeader
          userName={user.name || 'Developer'}
          repoCount={repos.length}
          overallScore={overallScore}
        />

        <LimitsBanner
          repoCount={repos.length}
          currentTeamId={currentTeamId}
          teams={teams}
          analyzedRepoCount={repos.filter((r) => r.latestAnalysis).length}
          billingLoading={billingLoading}
          onPortal={handlePortal}
          onCheckout={handleCheckout}
        />

        {/* Upload error banner */}
        <AnimatePresence>
          {uploadError && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl flex justify-between items-center">
              <span>{uploadError}</span>
              <button
                onClick={() => setUploadError(null)}
                className="ml-4 font-bold text-xl leading-none hover:text-red-100"
              >
                ×
              </button>
            </div>
          )}
        </AnimatePresence>

        {/* Repositories section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Repositories</h2>
            <button
              onClick={() => setShowAddRepo(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <span className="text-lg leading-none">+</span> Add Repository
            </button>
          </div>

          {repos.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="mb-6 inline-block text-6xl text-slate-50">
                <RocketIcon className="w-14 h-14" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Get Started with AIReady
              </h3>
              <p className="text-slate-400 max-w-md mx-auto mb-8">
                Add a repository, run the CLI, then upload the results to get
                your AI readiness score.
              </p>
              <button
                onClick={() => setShowAddRepo(true)}
                className="mt-8 btn-primary"
              >
                Add Your First Repository
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence>
                {repos.map((repo, index) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    index={index}
                    uploading={uploadingRepoId === repo.id}
                    scanning={
                      scanningRepoId === repo.id ||
                      pendingScanRepoIds.includes(repo.id)
                    }
                    onUpload={() => handleUploadAnalysis(repo.id)}
                    onScan={() => handleScanRepo(repo.id)}
                    onDelete={() => handleDeleteRepo(repo.id)}
                    onBadge={() =>
                      setRepoForBadge({ id: repo.id, name: repo.name })
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Trends Modal */}
        <AnimatePresence>
          {repoForTrends && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <TrendsView
                repoId={repoForTrends.id}
                repoName={repoForTrends.name}
                onClose={() => setRepoForTrends(null)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Badge Modal */}
        <BadgeModal repo={repoForBadge} onClose={() => setRepoForBadge(null)} />

        {/* CLI quickstart */}
        {repos.length > 0 && repos.every((r) => !r.latestAnalysis) && (
          <CliQuickstart />
        )}

        {/* Team Management Section */}
        {currentTeamId !== 'personal' && (
          <TeamManagement
            teamId={currentTeamId}
            teamName={
              teams.find((t) => t.teamId === currentTeamId)?.team.name || 'Team'
            }
          />
        )}
      </div>

      <AddRepoModal
        show={showAddRepo}
        onClose={() => setShowAddRepo(false)}
        onSubmit={handleAddRepo}
        form={addRepoForm}
        setForm={setAddRepoForm}
        loading={addRepoLoading}
        error={addRepoError}
      />
    </PlatformShell>
  );
}
