'use client';

import { useState } from 'react';
import { BookOpen, Code, Database, Shield, Zap, Users, Globe, Settings } from 'lucide-react';
import { useLanguage } from "@/contexts/localization/LanguageContext";

export function DocsInterface() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    {
      id: 'overview',
      title: t('docs.sections.overview'),
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ksc-white">{t('docs.project.title')}</h3>
          <p className="text-ksc-gray">
            {t('docs.project.description')}
          </p>
          
          <h4 className="text-md font-semibold text-ksc-white mt-6">{t('docs.project.features.title')}</h4>
                      <ul className="list-disc list-inside text-ksc-gray space-y-2">
              <li>{t('docs.project.features.krwPeg')}</li>
              <li>{t('docs.project.features.hybridArchitecture')}</li>
              <li>{t('docs.project.features.realtimeMonitoring')}</li>
              <li>{t('docs.project.features.walletSupport')}</li>
              <li>{t('docs.project.features.adminFunctions')}</li>
            </ul>
        </div>
      )
    },
    {
      id: 'architecture',
      title: t('docs.sections.architecture'),
      icon: Code,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ksc-white">{t('docs.architecture.title')}</h3>
          
          <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-border">
            <h4 className="font-semibold text-ksc-white mb-2">{t('docs.architecture.frontend')}</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>{t('docs.architecture.frontendStack.nextjs')}</li>
              <li>{t('docs.architecture.frontendStack.typescript')}</li>
              <li>{t('docs.architecture.frontendStack.tailwind')}</li>
              <li>{t('docs.architecture.frontendStack.reactQuery')}</li>
              <li>{t('docs.architecture.frontendStack.metamask')}</li>
            </ul>
          </div>
          
          <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-border">
            <h4 className="font-semibold text-ksc-white mb-2">{t('docs.architecture.backend')}</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>{t('docs.architecture.backendStack.nodejs')}</li>
              <li>{t('docs.architecture.backendStack.avalanche')}</li>
              <li>{t('docs.architecture.backendStack.xrpl')}</li>
              <li>{t('docs.architecture.backendStack.restful')}</li>
              <li>{t('docs.architecture.backendStack.security')}</li>
            </ul>
          </div>
          
          <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-border">
            <h4 className="font-semibold text-ksc-white mb-2">{t('docs.architecture.blockchain')}</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>{t('docs.architecture.blockchainStack.avalanche')}</li>
              <li>{t('docs.architecture.blockchainStack.xrpl')}</li>
              <li>{t('docs.architecture.blockchainStack.solidity')}</li>
              <li>{t('docs.architecture.blockchainStack.hardhat')}</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'smart-contract',
      title: t('docs.sections.smartContract'),
      icon: Database,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ksc-white">{t('docs.smartContract.title')}</h3>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">{t('docs.smartContract.mainFeatures')}</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>{t('docs.smartContract.features.erc20')}</li>
              <li>{t('docs.smartContract.features.adminMintBurn')}</li>
              <li>{t('docs.smartContract.features.emergencyPause')}</li>
              <li>{t('docs.smartContract.features.reentrancyGuard')}</li>
              <li>{t('docs.smartContract.features.eventLogging')}</li>
            </ul>
          </div>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">{t('docs.smartContract.securityFeatures')}</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>{t('docs.smartContract.security.ownable')}</li>
              <li>{t('docs.smartContract.security.pausable')}</li>
              <li>{t('docs.smartContract.security.reentrancyGuard')}</li>
              <li>{t('docs.smartContract.security.inputValidation')}</li>
            </ul>
          </div>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">{t('docs.smartContract.adminFunctions')}</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>{t('docs.smartContract.admin.mint')}</li>
              <li>{t('docs.smartContract.admin.burn')}</li>
              <li>{t('docs.smartContract.admin.emergencyPause')}</li>
              <li>{t('docs.smartContract.admin.emergencyUnpause')}</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      title: t('docs.sections.api'),
      icon: Zap,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ksc-white">{t('docs.api.title')}</h3>
          
          <div className="space-y-4">
            <div className="border border-ksc-border rounded-lg p-4 bg-ksc-box/30">
              <h4 className="font-semibold text-ksc-white mb-2">{t('docs.api.avalanche')}</h4>
              <div className="text-sm space-y-2">
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">GET /api/avalanche/balance/:address</code> - {t('docs.api.endpoints.balance')}</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">GET /api/avalanche/contract-info</code> - {t('docs.api.endpoints.contractInfo')}</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">POST /api/avalanche/transfer</code> - {t('docs.api.endpoints.transfer')}</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">GET /api/avalanche/transaction/:hash</code> - {t('docs.api.endpoints.transaction')}</div>
              </div>
            </div>
            
            <div className="border border-ksc-border rounded-lg p-4 bg-ksc-box/30">
              <h4 className="font-semibold text-ksc-white mb-2">{t('docs.api.xrpl')}</h4>
              <div className="text-sm space-y-2">
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">GET /api/xrpl/balance/:address</code> - {t('docs.api.endpoints.xrplBalance')}</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">POST /api/xrpl/transfer</code> - {t('docs.api.endpoints.xrplTransfer')}</div>
              </div>
            </div>
            
            <div className="border border-ksc-border rounded-lg p-4 bg-ksc-box/30">
              <h4 className="font-semibold text-ksc-white mb-2">{t('docs.api.admin')}</h4>
              <div className="text-sm space-y-2">
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">POST /api/admin/mint</code> - {t('docs.api.endpoints.mint')}</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">POST /api/admin/burn</code> - {t('docs.api.endpoints.burn')}</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">POST /api/admin/pause</code> - {t('docs.api.endpoints.pause')}</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">POST /api/admin/unpause</code> - {t('docs.api.endpoints.unpause')}</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: t('docs.sections.security'),
      icon: Shield,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ksc-white">{t('docs.security.title')}</h3>
          
          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
            <h4 className="font-semibold text-red-400 mb-2">{t('docs.security.smartContract')}</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>{t('docs.security.smartContractFeatures.openzeppelin')}</li>
              <li>{t('docs.security.smartContractFeatures.reentrancyGuard')}</li>
              <li>{t('docs.security.smartContractFeatures.accessControl')}</li>
              <li>{t('docs.security.smartContractFeatures.emergencyPause')}</li>
              <li>{t('docs.security.smartContractFeatures.inputValidation')}</li>
            </ul>
          </div>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">{t('docs.security.backend')}</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>{t('docs.security.backendFeatures.cors')}</li>
              <li>{t('docs.security.backendFeatures.rateLimiting')}</li>
              <li>{t('docs.security.backendFeatures.helmet')}</li>
              <li>{t('docs.security.backendFeatures.inputValidation')}</li>
              <li>{t('docs.security.backendFeatures.errorHandling')}</li>
            </ul>
          </div>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">{t('docs.security.frontend')}</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>{t('docs.security.frontendFeatures.metamask')}</li>
              <li>{t('docs.security.frontendFeatures.https')}</li>
              <li>{t('docs.security.frontendFeatures.xss')}</li>
              <li>{t('docs.security.frontendFeatures.envVars')}</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'deployment',
      title: t('docs.sections.deployment'),
      icon: Settings,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ksc-white">{t('docs.deployment.title')}</h3>
          
          <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-border">
            <h4 className="font-semibold text-ksc-white mb-2">{t('docs.deployment.devEnvironment')}</h4>
            <div className="text-sm text-ksc-gray space-y-2">
              <div><strong>{t('docs.deployment.labels.nodejs')}</strong> {t('docs.deployment.nodejs')}</div>
              <div><strong>{t('docs.deployment.labels.npm')}</strong> {t('docs.deployment.npm')}</div>
              <div><strong>{t('docs.deployment.labels.metamask')}</strong> {t('docs.deployment.metamask')}</div>
              <div><strong>{t('docs.deployment.labels.hardhat')}</strong> {t('docs.deployment.hardhat')}</div>
            </div>
          </div>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">{t('docs.deployment.localDeployment')}</h4>
            <div className="text-sm text-ksc-gray space-y-2">
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">npm install</code> - {t('docs.deployment.installDeps')}</div>
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">npm run dev</code> - {t('docs.deployment.runDev')}</div>
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">npm run build</code> - {t('docs.deployment.buildProd')}</div>
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">npm run test</code> - {t('docs.deployment.runTests')}</div>
            </div>
          </div>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">{t('docs.deployment.testnetDeployment')}</h4>
            <div className="text-sm text-ksc-gray space-y-2">
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">cd contracts</code> - {t('docs.deployment.moveToContracts')}</div>
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">npm run deploy</code> - {t('docs.deployment.deployToFuji')}</div>
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">npm run verify</code> - {t('docs.deployment.verifyContract')}</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* 사이드바 네비게이션 */}
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <nav className="card bg-ksc-card border-ksc-border p-4 sticky top-24">
            <h3 className="text-lg font-semibold text-ksc-white mb-4">{t('docs.tableOfContents')}</h3>
            <ul className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-ksc-mint/20 text-ksc-mint border border-ksc-mint/30'
                          : 'text-ksc-gray hover:bg-ksc-box/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="lg:col-span-3">
          <div className="card bg-ksc-card border-ksc-border p-8">
            {sections.find(s => s.id === activeSection)?.content}
          </div>
        </div>
      </div>
    </div>
  );
} 