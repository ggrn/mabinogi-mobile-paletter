import { useState } from 'react'
import './App.css'
import { ColorInput } from './components/ColorInput'
import { ColorHistory } from './components/ColorHistory'
import { ScreenCapture } from './components/ScreenCapture'

function App() {
  const [activeTab, setActiveTab] = useState<'capture' | 'history'>('capture')

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">마비노기 모바일 팔레터</h1>
        <ol className="text-gray-600 mt-2 list-decimal pl-6 text-left max-w-md mx-auto">
          <li>화면 공유 시작</li>
          <li>창 → 마비노기 모바일 선택 후 "공유" 클릭</li>
          <li>영역 선택해서, 염색 영역 지정</li>
        </ol>
      </header>

      <main className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {/* 색상 입력 섹션 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">색상 입력</h2>
            <ColorInput />
          </section>

          {/* 탭 네비게이션 */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'capture'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('capture')}
            >
              화면 캡처
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('history')}
            >
              히스토리 / 프리셋
            </button>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="mt-4">
            {activeTab === 'capture' ? <ScreenCapture /> : <ColorHistory />}
          </div>
        </div>
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 마비노기 모바일 팔레터 - 마비노기 모바일 색상 찾기 도우미</p>
      </footer>
    </div>
  )
}

export default App
