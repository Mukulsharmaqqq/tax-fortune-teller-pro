import { useState } from "react";
import { Calculator, Trophy, Shield, Zap, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  name: string;
  email: string;
  filing: string;
  deduction: string;
  scheduleC: string;
  scheduleCIncome: string;
  scheduleD: string;
  scheduleE: string;
  k1Forms: number;
  states: number;
  foreignIncome: string;
}

interface QuoteResult {
  total: number;
  breakdown: {
    base: number;
    scheduleC: number;
    scheduleD: number;
    scheduleE: number;
    k1: number;
    states: number;
    foreignIncome: string;
  };
}

const filingStatuses = [
  "Single",
  "Married Filing Separate", 
  "Married Filing Jointly"
];

const deductionTypes = [
  "Standard",
  "Itemized"
];

const baseFeeMap = {
  "Single + Standard": 300,
  "Married Filing Separate + Standard": 300,
  "Married Filing Jointly + Standard": 350,
  "Single + Itemized": 350,
  "Married Filing Separate + Itemized": 350,
  "Married Filing Jointly + Itemized": 400
};

export function TaxQuoteCalculator() {
  const [showQuote, setShowQuote] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    filing: "",
    deduction: "",
    scheduleC: "",
    scheduleCIncome: "",
    scheduleD: "",
    scheduleE: "",
    k1Forms: 0,
    states: 1,
    foreignIncome: ""
  });
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const { toast } = useToast();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim() || !emailRegex.test(formData.email)) {
      toast({
        title: "Required Fields Missing",
        description: "Please provide your name and a valid email address.",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.filing || !formData.deduction) {
      toast({
        title: "Please Complete All Fields",
        description: "Filing status and deduction type are required.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const calculateQuote = () => {
    if (!validateForm()) return;

    const baseKey = `${formData.filing} + ${formData.deduction}` as keyof typeof baseFeeMap;
    const base = baseFeeMap[baseKey];
    
    const scheduleC = formData.scheduleC === "No" ? 0 : 
      formData.scheduleCIncome === "< $250,000" ? 50 : 100;
    
    const scheduleD = formData.scheduleD === "Yes" ? 50 : 0;
    const scheduleE = formData.scheduleE === "Yes" ? 50 : 0;
    const k1 = formData.k1Forms * 100;
    const states = (formData.states - 1) * 100;
    const foreignIncome = formData.foreignIncome === "Yes" ? "Discussed during consultation" : "";
    
    const breakdown = {
      base,
      scheduleC,
      scheduleD,
      scheduleE,
      k1,
      states,
      foreignIncome
    };

    const total = breakdown.base + breakdown.scheduleC + breakdown.scheduleD + 
                 breakdown.scheduleE + breakdown.k1 + breakdown.states;
    
    setQuote({ total, breakdown });
    setShowQuote(true);
    const leadEmail = new URLSearchParams(window.location.search).get("sendto");
if (leadEmail) {
  fetch(`https://formsubmit.co/ajax/${leadEmail}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name:   formData.name,
      email:  formData.email,
      quote:  total,
      filing: formData.filing,
      deduction: formData.deduction,
      scheduleC: formData.scheduleC,
      scheduleD: formData.scheduleD,
      scheduleE: formData.scheduleE,
      k1Forms: formData.k1Forms,
      states:  formData.states,
      foreignIncome: formData.foreignIncome
    })
  });
}
    
    // Send webhook
    fetch("YOUR_WEBHOOK_URL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        total: total
      }),
    }).catch(() => {}); // Silent fail
    
    toast({
      title: "Quote Generated! 🎉",
      description: "Your 1040 pricing estimate is ready."
    });
  };

  const handleAcceptQuote = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingUrl = urlParams.get('booking');
    if (bookingUrl) {
      window.open(bookingUrl, '_blank');
    }
  };

  const resetCalculator = () => {
    setShowQuote(false);
    setFormData({
      name: "",
      email: "",
      filing: "",
      deduction: "",
      scheduleC: "",
      scheduleCIncome: "",
      scheduleD: "",
      scheduleE: "",
      k1Forms: 0,
      states: 1,
      foreignIncome: ""
    });
    setQuote(null);
  };


  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl card-enterprise animate-fade-in">
        <CardContent className="p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-primary rounded-2xl shadow-lg">
                <Calculator className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                1040 Pricing Estimator
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get an estimate for your tax return preparation costs
            </p>
          </div>

          {/* Input Form */}
          {!showQuote && (
            <div className="space-y-8 animate-slide-up">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Filing Status</Label>
                  <RadioGroup
                    value={formData.filing}
                    onValueChange={(value) => setFormData({...formData, filing: value})}
                    className="grid sm:grid-cols-2 gap-4"
                  >
                    {filingStatuses.map((status) => (
                      <div key={status} className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:bg-accent transition-colors">
                        <RadioGroupItem value={status} id={status} />
                        <Label htmlFor={status} className="flex-1 cursor-pointer text-sm font-medium">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Deduction Type</Label>
                  <RadioGroup
                    value={formData.deduction}
                    onValueChange={(value) => setFormData({...formData, deduction: value})}
                    className="grid grid-cols-2 gap-4"
                  >
                    {deductionTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:bg-accent transition-colors">
                        <RadioGroupItem value={type} id={`deduction-${type}`} />
                        <Label htmlFor={`deduction-${type}`} className="flex-1 cursor-pointer text-sm font-medium">
                          {type} Deduction
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Schedule C - Business Income</Label>
                  <RadioGroup
                    value={formData.scheduleC}
                    onValueChange={(value) => setFormData({...formData, scheduleC: value})}
                    className="grid grid-cols-2 gap-4"
                  >
                    {["Yes", "No"].map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:bg-accent transition-colors">
                        <RadioGroupItem value={option} id={`scheduleC-${option}`} />
                        <Label htmlFor={`scheduleC-${option}`} className="flex-1 cursor-pointer text-sm font-medium">
                          {option === "Yes" ? "Yes, I have business income" : "No business income"}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  {formData.scheduleC === "Yes" && (
                    <div className="mt-4">
                      <Label className="text-sm font-semibold mb-2 block">Business Income Level</Label>
                      <RadioGroup
                        value={formData.scheduleCIncome}
                        onValueChange={(value) => setFormData({...formData, scheduleCIncome: value})}
                        className="grid grid-cols-2 gap-4"
                      >
                        {["< $250,000", "≥ $250,000"].map((level) => (
                          <div key={level} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                            <RadioGroupItem value={level} id={`income-${level}`} />
                            <Label htmlFor={`income-${level}`} className="flex-1 cursor-pointer text-sm">
                              {level}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Schedule D - Capital Gains/Losses</Label>
                  <RadioGroup
                    value={formData.scheduleD}
                    onValueChange={(value) => setFormData({...formData, scheduleD: value})}
                    className="grid grid-cols-2 gap-4"
                  >
                    {["Yes", "No"].map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:bg-accent transition-colors">
                        <RadioGroupItem value={option} id={`scheduleD-${option}`} />
                        <Label htmlFor={`scheduleD-${option}`} className="flex-1 cursor-pointer text-sm font-medium">
                          {option === "Yes" ? "Yes, I have capital gains/losses" : "No capital gains/losses"}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Schedule E - Rental Income</Label>
                  <RadioGroup
                    value={formData.scheduleE}
                    onValueChange={(value) => setFormData({...formData, scheduleE: value})}
                    className="grid grid-cols-2 gap-4"
                  >
                    {["Yes", "No"].map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:bg-accent transition-colors">
                        <RadioGroupItem value={option} id={`scheduleE-${option}`} />
                        <Label htmlFor={`scheduleE-${option}`} className="flex-1 cursor-pointer text-sm font-medium">
                          {option === "Yes" ? "Yes, I have rental income" : "No rental income"}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">
                      K-1 Forms: <span className="text-primary font-bold">{formData.k1Forms === 20 ? '20+' : formData.k1Forms}</span>
                    </Label>
                    <div className="px-3">
                      <Slider
                        value={[formData.k1Forms]}
                        onValueChange={(value) => setFormData({...formData, k1Forms: value[0]})}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>20+</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">
                      Total States: <span className="text-primary font-bold">{formData.states === 10 ? '10+' : formData.states}</span>
                    </Label>
                    <div className="px-3">
                      <Slider
                        value={[formData.states]}
                        onValueChange={(value) => setFormData({...formData, states: value[0]})}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1</span>
                      <span>10+</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Foreign Income</Label>
                  <RadioGroup
                    value={formData.foreignIncome}
                    onValueChange={(value) => setFormData({...formData, foreignIncome: value})}
                    className="grid grid-cols-2 gap-4"
                  >
                    {["Yes", "No"].map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:bg-accent transition-colors">
                        <RadioGroupItem value={option} id={`foreign-${option}`} />
                        <Label htmlFor={`foreign-${option}`} className="flex-1 cursor-pointer text-sm font-medium">
                          {option === "Yes" ? "Yes, I have foreign income" : "No foreign income"}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="text-center mt-12">
                <Button onClick={calculateQuote} className="btn-enterprise px-12 py-4 text-lg">
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate My Quote
                </Button>
              </div>
            </div>
          )}

          {/* Quote Results */}
          {showQuote && quote && (
            <div className="text-center space-y-8 animate-slide-up">
              <div className="bg-gradient-success text-success-foreground rounded-2xl p-8 mb-8">
                <div className="text-5xl font-bold mb-2 animate-bounce-gentle">
                  ${quote.total.toLocaleString()}
                </div>
                <p className="text-xl opacity-90">Your 1040 Preparation Cost</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-bold text-primary">${quote.breakdown.base}</div>
                  <div className="text-sm text-muted-foreground">Base Filing</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-bold text-primary">${quote.breakdown.scheduleC}</div>
                  <div className="text-sm text-muted-foreground">Schedule C</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-bold text-primary">${quote.breakdown.scheduleD}</div>
                  <div className="text-sm text-muted-foreground">Schedule D</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-bold text-primary">${quote.breakdown.scheduleE}</div>
                  <div className="text-sm text-muted-foreground">Schedule E</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-bold text-primary">${quote.breakdown.k1}</div>
                  <div className="text-sm text-muted-foreground">K-1 Forms ({formData.k1Forms === 20 ? '20+' : formData.k1Forms})</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-bold text-primary">${quote.breakdown.states}</div>
                  <div className="text-sm text-muted-foreground">Additional States ({formData.states === 10 ? '10+' : formData.states - 1})</div>
                </div>
                {quote.breakdown.foreignIncome && (
                  <div className="bg-card rounded-xl p-4 border border-border col-span-full">
                    <div className="text-lg font-bold text-amber-600"> Discussed Over Call</div>
                    <div className="text-sm text-muted-foreground">Foreign Income</div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleAcceptQuote} className="btn-success px-8 py-3">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Accept Quote & Continue
                </Button>
                <Button variant="outline" onClick={resetCalculator} className="px-8 py-3">
                  Calculate New Quote
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}