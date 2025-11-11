"use client";

import { useState, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import QRCode from "qrcode.react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Shield, ShieldHalf, ShieldCheck, Download, FileJson, FileText, QrCode, GitCompareArrows, Upload, Lightbulb, Dices, FileDown, ShieldQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { md5 } from "@/lib/md5";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const algorithms = [
  {
    id: "md5",
    label: "MD5",
    icon: <Shield size={20} className="text-accent" />,
  },
  {
    id: "sha256",
    label: "SHA-256",
    icon: <ShieldHalf size={20} className="text-accent" />,
  },
  {
    id: "sha512",
    label: "SHA-512",
    icon: <ShieldCheck size={20} className="text-accent" />,
  },
];

async function generateHashInternal(text: string, algorithm: string, salt: string = '', saltPosition: 'prefix' | 'postfix' = 'prefix') {
  const textToHash = saltPosition === 'prefix' ? salt + text : text + salt;
  if (textToHash === "") {
    return "";
  }
  let hash = "";
  if (algorithm === "md5") {
    hash = md5(textToHash);
  } else {
    const algoName = algorithm.toUpperCase().replace("SHA", "SHA-");
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      throw new Error('Crypto API not available');
    }
    const msgUint8 = new TextEncoder().encode(textToHash);
    const hashBuffer = await crypto.subtle.digest(algoName, msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return hash;
}


function HashGeneratorTool() {
  const [inputText, setInputText] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("sha256");
  const [hashedOutput, setHashedOutput] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [useSalt, setUseSalt] = useState(false);
  const [salt, setSalt] = useState("");
  const [saltPosition, setSaltPosition] = useState<'prefix' | 'postfix'>("prefix");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const generateAndSetHash = async () => {
      try {
        const finalSalt = useSalt ? salt : "";
        const hash = await generateHashInternal(inputText, selectedAlgorithm, finalSalt, saltPosition);
        setHashedOutput(hash);
      } catch (error) {
        console.error("Hashing failed:", error);
        let description = "Could not generate hash. Please try again.";
        if (error instanceof Error && error.message.includes('Crypto')) {
          description = "Secure context required. This feature works best on localhost or HTTPS.";
        }
        
        setHashedOutput("Error generating hash.");
        toast({
          title: "Hashing Error",
          description: description,
          variant: "destructive",
        });
      }
    };

    startTransition(() => {
      generateAndSetHash();
    });
  }, [inputText, selectedAlgorithm, toast, useSalt, salt, saltPosition]);
  
  const generateRandomSalt = () => {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const randomSalt = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    setSalt(randomSalt);
    toast({ title: "Generated random salt!" });
  };

  const handleCopy = async () => {
    if (!hashedOutput || isPending || hashedOutput.startsWith("Error")) return;
    try {
      await navigator.clipboard.writeText(hashedOutput);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy hash to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (format: "txt" | "json" | "qr") => {
    if (!hashedOutput || isPending || hashedOutput.startsWith("Error")) return;

    if (format === 'qr') {
        const canvas = document.querySelector<HTMLCanvasElement>('#qr-code-canvas');
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${selectedAlgorithm}_hash.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
             toast({ title: "QR Code downloaded!" });
        }
        return;
    }

    let content = "";
    let mimeType = "";
    let filename = "";

    if (format === "txt") {
      content = hashedOutput;
      mimeType = "text/plain";
      filename = `${selectedAlgorithm}_hash.txt`;
    } else if (format === "json") {
      content = JSON.stringify({
        text: inputText,
        algorithm: selectedAlgorithm,
        hash: hashedOutput,
        ...(useSalt && { salt, saltPosition }),
      }, null, 2);
      mimeType = "application/json";
      filename = `${selectedAlgorithm}_hash.json`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded " + filename });
  };


  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="text-input" className="font-medium">Input Text</Label>
          <Textarea
            id="text-input"
            placeholder="Type or paste your text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[150px] text-base focus:ring-accent"
            aria-label="Text to hash"
          />
        </div>
        
        <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <ShieldQuestion size={20} className="text-accent" />
                    <Label htmlFor="salt-switch" className="font-medium">Salt / Pepper</Label>
                </div>
                <Switch id="salt-switch" checked={useSalt} onCheckedChange={setUseSalt} />
            </div>
            {useSalt && (
                <div className="space-y-4 pt-4 border-t border-dashed">
                     <div className="relative">
                        <Label htmlFor="salt-input">Value</Label>
                        <Input id="salt-input" placeholder="Enter custom salt/pepper or generate one" value={salt} onChange={(e) => setSalt(e.target.value)} className="pr-10" />
                        <Button variant="ghost" size="icon" className="absolute right-1 top-6 h-8 w-8" onClick={generateRandomSalt}><Dices size={18}/></Button>
                    </div>
                    <div>
                        <Label>Position</Label>
                         <RadioGroup
                            value={saltPosition}
                            onValueChange={(value) => setSaltPosition(value as 'prefix' | 'postfix')}
                            className="grid grid-cols-2 gap-4 pt-2"
                        >
                             <Label className="flex items-center space-x-2 p-3 rounded-md border-2 border-transparent bg-secondary/50 cursor-pointer hover:border-primary/50 transition-all text-sm">
                                <RadioGroupItem value="prefix" id="prefix" />
                                <span>Prefix (salt + text)</span>
                             </Label>
                             <Label className="flex items-center space-x-2 p-3 rounded-md border-2 border-transparent bg-secondary/50 cursor-pointer hover:border-primary/50 transition-all text-sm">
                                <RadioGroupItem value="postfix" id="postfix" />
                                <span>Postfix (text + salt)</span>
                             </Label>
                        </RadioGroup>
                    </div>
                </div>
            )}
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Algorithm</Label>
          <RadioGroup
            value={selectedAlgorithm}
            onValueChange={setSelectedAlgorithm}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {algorithms.map((algo) => (
              <Label
                key={algo.id}
                htmlFor={algo.id}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-md border-2 border-transparent bg-secondary cursor-pointer hover:border-primary/50 transition-all",
                  selectedAlgorithm === algo.id &&
                    "border-primary ring-2 ring-primary/50"
                )}
              >
                <RadioGroupItem value={algo.id} id={algo.id} className="border-muted-foreground" />
                {algo.icon}
                <span className="font-semibold text-foreground">{algo.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </div>
       <div className="w-full space-y-2 mt-6">
        <Label htmlFor="hash-output" className="font-medium">Generated Hash</Label>
        <div className="relative">
          <Input
            id="hash-output"
            readOnly
            value={isPending ? "Generating..." : hashedOutput}
            placeholder="Your hash will appear here"
            className="pr-24 h-12 text-base font-code bg-input/80 text-foreground truncate"
            aria-label="Generated hash"
            aria-live="polite"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
             <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                disabled={!hashedOutput || isPending || hashedOutput.startsWith("Error")}
                className="h-10 w-10 text-accent hover:text-accent-foreground"
                aria-label="Copy hash"
              >
                <Copy
                  className={cn(
                    "transition-transform duration-300",
                    isCopied && "scale-125 rotate-12 text-primary"
                  )}
                />
              </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!hashedOutput || isPending || hashedOutput.startsWith("Error")}
                  className="h-10 w-10 text-accent hover:text-accent-foreground"
                  aria-label="Download hash"
                >
                  <Download />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => handleDownload("txt")}><FileText className="mr-2" />TXT</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleDownload("json")}><FileJson className="mr-2" />JSON</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleDownload("qr")}><QrCode className="mr-2" />QR Code</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div style={{ display: 'none' }}>
        <QRCode id="qr-code-canvas" value={hashedOutput} size={256} level={"H"} />
      </div>

       <Alert className="mt-6">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>What are Salt and Pepper?</AlertTitle>
        <AlertDescription className="text-sm">
          <p className="mt-2"><strong>Salt:</strong> A unique, random string added to each input before hashing. It ensures that even identical inputs result in different hashes, protecting against pre-computed hash tables (rainbow tables).</p>
          <p className="mt-2"><strong>Pepper:</strong> A secret, static string added before hashing, typically stored securely and separately from your data. It adds an extra layer of security, making it much harder for attackers to crack hashes even if they compromise your database.</p>
        </AlertDescription>
      </Alert>
    </>
  );
}

function HashComparisonTool() {
    const [inputText1, setInputText1] = useState('');
    const [inputText2, setInputText2] = useState('');
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('sha256');
    const [hash1, setHash1] = useState('');
    const [hash2, setHash2] = useState('');
    const [areHashesMatching, setAreHashesMatching] = useState<boolean | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const h1 = await generateHashInternal(inputText1, selectedAlgorithm);
            const h2 = await generateHashInternal(inputText2, selectedAlgorithm);
            setHash1(h1);
            setHash2(h2);
            if(inputText1 && inputText2) {
              setAreHashesMatching(h1 === h2);
            } else {
              setAreHashesMatching(null);
            }
        });
    }, [inputText1, inputText2, selectedAlgorithm]);

    return (
        <div className="space-y-6">
            <div className="space-y-3">
              <Label className="font-medium">Algorithm</Label>
              <RadioGroup
                value={selectedAlgorithm}
                onValueChange={setSelectedAlgorithm}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {algorithms.map((algo) => (
                  <Label
                    key={algo.id}
                    htmlFor={`compare-${algo.id}`}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-md border-2 border-transparent bg-secondary cursor-pointer hover:border-primary/50 transition-all",
                      selectedAlgorithm === algo.id && "border-primary ring-2 ring-primary/50"
                    )}
                  >
                    <RadioGroupItem value={algo.id} id={`compare-${algo.id}`} className="border-muted-foreground" />
                    {algo.icon}
                    <span className="font-semibold text-foreground">{algo.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="text-input-1">Input Text 1</Label>
                    <Textarea
                        id="text-input-1"
                        placeholder="Paste first text here"
                        value={inputText1}
                        onChange={(e) => setInputText1(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <Input readOnly value={isPending && inputText1 ? "Generating..." : hash1} placeholder="Hash of text 1" className="font-code"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="text-input-2">Input Text 2</Label>
                    <Textarea
                        id="text-input-2"
                        placeholder="Paste second text here"
                        value={inputText2}
                        onChange={(e) => setInputText2(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <Input readOnly value={isPending && inputText2 ? "Generating..." : hash2} placeholder="Hash of text 2" className="font-code" />
                </div>
            </div>
            {areHashesMatching !== null && (
                <div className={cn("p-4 rounded-md text-center font-bold", areHashesMatching ? "bg-green-800/60 text-green-200" : "bg-red-800/60 text-red-300")}>
                    {areHashesMatching ? '✅ Hashes Match' : '❌ Hashes Do Not Match'}
                </div>
            )}
        </div>
    );
}

type BatchResult = {
    line: number;
    input: string;
    hash: string;
};

function BatchHashingTool() {
    const [results, setResults] = useState<BatchResult[]>([]);
    const [isPending, startTransition] = useTransition();
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('sha256');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

            startTransition(async () => {
                const newResults: BatchResult[] = await Promise.all(
                    lines.map(async (line, index) => ({
                        line: index + 1,
                        input: line,
                        hash: await generateHashInternal(line, selectedAlgorithm),
                    }))
                );
                setResults(newResults);
                toast({ title: `Processed ${newResults.length} lines.` });
            });
        };
        reader.readAsText(file);
    };

    const handleDownload = (format: 'csv' | 'json') => {
        if (results.length === 0) {
            toast({ variant: 'destructive', title: 'No results to download.'});
            return;
        };

        let content = '';
        let mimeType = '';
        let filename = `batch_hashes_${selectedAlgorithm}.${format}`;

        if (format === 'json') {
            content = JSON.stringify(results, null, 2);
            mimeType = 'application/json';
        } else { // csv
            const header = 'line,input,hash\n';
            const rows = results.map(r => `${r.line},"${r.input.replace(/"/g, '""')}",${r.hash}`).join('\n');
            content = header + rows;
            mimeType = 'text/csv';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: `Downloaded ${filename}` });
    };

    return (
        <div className="space-y-6">
             <div className="space-y-3">
                <Label className="font-medium">Algorithm</Label>
                <RadioGroup value={selectedAlgorithm} onValueChange={setSelectedAlgorithm} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {algorithms.map((algo) => (
                        <Label key={`batch-${algo.id}`} htmlFor={`batch-${algo.id}`}
                            className={cn("flex items-center space-x-3 p-4 rounded-md border-2 border-transparent bg-secondary cursor-pointer hover:border-primary/50 transition-all", selectedAlgorithm === algo.id && "border-primary ring-2 ring-primary/50")}>
                            <RadioGroupItem value={algo.id} id={`batch-${algo.id}`} className="border-muted-foreground" />
                            {algo.icon}
                            <span className="font-semibold text-foreground">{algo.label}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </div>
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.csv" className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} className="w-full" disabled={isPending}>
                <Upload className="mr-2" /> {isPending ? 'Processing...' : 'Upload .txt or .csv File'}
            </Button>
            
            {results.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Results ({results.length})</h3>
                        <div>
                             <Button variant="outline" size="sm" onClick={() => handleDownload('csv')} className="mr-2"><FileDown className="mr-2 h-4 w-4" /> CSV</Button>
                             <Button variant="outline" size="sm" onClick={() => handleDownload('json')}><FileDown className="mr-2 h-4 w-4" /> JSON</Button>
                        </div>
                    </div>
                     <Card className="max-h-[300px] overflow-y-auto">
                        <CardContent className="p-0">
                           <div className="w-full text-sm">
                                <div className="grid grid-cols-[40px_1fr_2fr] gap-4 p-2 font-bold bg-secondary/50 sticky top-0">
                                    <div>#</div>
                                    <div>Input</div>
                                    <div>Hash</div>
                                </div>
                                {results.map(res => (
                                    <div key={res.line} className="grid grid-cols-[40px_1fr_2fr] gap-4 p-2 border-b last:border-b-0 font-code text-xs">
                                        <div className="truncate">{res.line}</div>
                                        <div className="truncate">{res.input}</div>
                                        <div className="truncate">{res.hash}</div>
                                    </div>
                                ))}
                           </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export function HashGenerator() {
  return (
    <Card className="w-full max-w-2xl shadow-2xl bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline tracking-tight">
          Hashify
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          A versatile cryptographic hash toolkit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator" className="flex-1"><ShieldCheck className="mr-2" />Generator</TabsTrigger>
            <TabsTrigger value="comparison" className="flex-1"><GitCompareArrows className="mr-2" />Compare</TabsTrigger>
            <TabsTrigger value="batch" className="flex-1"><Upload className="mr-2" />Batch</TabsTrigger>
          </TabsList>
          <TabsContent value="generator" className="pt-6">
            <HashGeneratorTool />
          </TabsContent>
          <TabsContent value="comparison" className="pt-6">
            <HashComparisonTool />
          </TabsContent>
           <TabsContent value="batch" className="pt-6">
            <BatchHashingTool />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
