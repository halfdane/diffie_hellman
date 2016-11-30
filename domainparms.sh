#!/bin/bash

# Tool to experiment with domain parameters that can be
# used for the "manual" diffie hellman calculations ( g^a % p ) that's 
# done in the workshop.
# 
# If you use just any random number, you often get strange
# results, p.e. the result being either equal to one of the 
# domain parameters g, p or a. Or the result being very small (p.e. 1).
#
# To reduce the risk of dissatisfied customers of the workshop,
# try to use random 4-digit primes for p and
# any 5-digit random number for g and a.
#
# Apparently, if you use 5-digit random numbers for all the parameters,
# you should be fine as well.
# 
# Run the skript to make 1000 testruns with current random params and have the
# "strange" results printed to stdout
#
# Adjust the function randPrime to check how large the prime should be
# Adjust the function rand to check how large the random numbers should be

function rand() {
    echo `shuf -i10000-100000 -n1`
}

function randPrime() {
    factor {100..1000} | awk 'NF==2{print $2}' | sort -R | head -n 1
}

function strange() {
    g=$1;
    p=$2;
    a=$3;
    r=$4;
    
    if [ $g -eq $r ] ||
            [ $p -eq $r ] ||
            [ $a -eq $r ] ||
            [ $r -lt 10 ] ||
            [ $r -eq 1 ] ; then
        return -1;
    fi
    return 0;
}

PROBS=""
CNT=1
for i in `seq 1000`; do
    p=$(rand)
    g=$(rand)
    a=$(rand)
    r=`echo "$g^$a%$p"|bc`
    CNT=`echo "($CNT + 1) % 10" | bc`
    
    if [ $CNT -eq 0 ]; then
        echo -n "|"
    else
        echo -n "."
    fi
    
    #echo "$g^$a%$p = $r"
    strange $g $p $a $r
    if [ $? -ne 0 ]; then
        PROBS="$PROBS\necho \"$g^$a%$p\" | bc = $r"
    fi
done

echo -e "\nStrange results:$PROBS"