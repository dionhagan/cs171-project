library(lmerTest)
library(RJSONIO)
##this is just one example of how LMER may be used to investigate
##college-by-college differences. 

datanormed<-read.csv("../client/data/collegedata_normalized.csv")

factors = c('canAfford','female','MinorityGender','MinorityRace','international','sports', 'earlyAppl')
effects = list()

for (i in factors) {
  f <- paste("acceptStatus~", i, "+(1+", i, "|name)")
  print (f)
  model<-glmer(as.formula(f),family="binomial",data=datanormed)
  df<-data.frame(matrix(nrow=25,ncol=2))
  df$names<-row.names(coef(model)$name)
  df$vals<-coef(model)$name[,2]
  df$X1 = NULL
  df$X2 = NULL
  effects[[i]] = df
}

outJS = toJSON(effects)
write(outJS,"../client/data/factors.json")
