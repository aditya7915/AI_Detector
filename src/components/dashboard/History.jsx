import React, { useState, useEffect } from 'react';
import { Clock, FileText, Download, ChevronRight, Loader2, Database } from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, orderBy, doc } from 'firebase/firestore';

const History = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const reportsRef = collection(userDocRef, "reports");
        
        const q = query(
          reportsRef,
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedReports = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleDateString() : 'N/A'
        }));
        
        setReports(fetchedReports);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleDownload = (report) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `bias_report_${report.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Multiverse Logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Report History</h2>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <Database size={14} /> {reports.length} Reports Stored
        </div>
      </div>

      <div className="glass-card !p-0 overflow-hidden">
        {reports.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-sm font-bold text-gray-400">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-400">Filename / Source</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-400">Bias Score</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-400">Worlds</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm flex items-center gap-2 text-gray-400">
                    <Clock size={14} /> {report.date}
                  </td>
                  <td className="px-6 py-4 font-medium truncate max-w-[200px]">{report.fileName || 'API Scan'}</td>
                  <td className="px-6 py-4 text-sm font-mono text-blue-400 font-bold">{report.biasScore}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-white/5 text-gray-300">
                      {report.simulations?.length || 0} Simulations
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleDownload(report)}
                        className="text-gray-400 hover:text-white transition-colors" 
                        title="Download JSON"
                      >
                        <Download size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors" title="View Details">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center space-y-4">
            <FileText size={48} className="mx-auto text-gray-700" />
            <h3 className="text-xl font-bold text-gray-500">No History Found</h3>
            <p className="text-gray-600 max-w-sm mx-auto">Complete your first analysis to populate your compliance history log.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
